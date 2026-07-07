package com.campus.expresshelper.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.expresshelper.common.BusinessException;
import com.campus.expresshelper.domain.dto.OrderCreateRequest;
import com.campus.expresshelper.domain.entity.OrderInfo;
import com.campus.expresshelper.domain.entity.User;
import com.campus.expresshelper.domain.enums.OrderStatus;
import com.campus.expresshelper.domain.entity.OrderReview;
import com.campus.expresshelper.mapper.OrderInfoMapper;
import com.campus.expresshelper.mapper.OrderReviewMapper;
import com.campus.expresshelper.mapper.UserMapper;
import com.campus.expresshelper.util.MaskUtil;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OrderService {
    private static final String ORDER_TIMEOUT_KEY = "order:timeout:zset";
    private static final String ORDER_GRAB_LOCK_PREFIX = "order:grab:lock:";
    private static final String AUTO_CONFIRM_KEY = "order:auto_confirm:zset";

    private final OrderInfoMapper orderInfoMapper;
    private final UserMapper userMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final CreditService creditService;
    private final NoticeService noticeService;
    private final CreditRuleService creditRuleService;
    private final OrderReviewMapper orderReviewMapper;

    @Transactional
    public Long createOrder(OrderCreateRequest request) {
        OrderInfo order = new OrderInfo();
        order.setPublisherId(request.getPublisherId());
        order.setExpressCompany(request.getExpressCompany());
        order.setExpressNo(request.getExpressNo());
        order.setPickupCode(request.getPickupCode());
        order.setPickupCodeMasked(MaskUtil.pickupCodeMask(request.getPickupCode()));
        order.setStationName(request.getStationName());
        order.setExpressType(request.getExpressType());
        order.setPickupTimeRange(request.getPickupTimeRange());
        order.setDeliveryLocation(request.getDeliveryLocation());
        order.setRemark(request.getRemark());
        order.setFee(request.getFee());
        order.setAllowBargain(request.getAllowBargain());
        order.setStatus(OrderStatus.PENDING_GRAB.name());
        order.setVersion(0);
        order.setExpireAt(LocalDateTime.now().plusMinutes(request.getValidMinutes()));
        order.setContactPhone(request.getContactPhone());
        orderInfoMapper.insert(order);
        stringRedisTemplate.opsForZSet().add(ORDER_TIMEOUT_KEY, String.valueOf(order.getId()), order.getExpireAt().toEpochSecond(ZoneOffset.ofHours(8)));
        noticeService.send(request.getPublisherId(), "ORDER", "订单发布成功", "订单已进入待抢单大厅");
        return order.getId();
    }

    public List<OrderInfo> listGrabHall(String stationName, String expressType) {
        LambdaQueryWrapper<OrderInfo> wrapper = new LambdaQueryWrapper<OrderInfo>()
                .eq(OrderInfo::getStatus, OrderStatus.PENDING_GRAB.name())
                .orderByDesc(OrderInfo::getCreatedAt);
        if (stationName != null && !stationName.isBlank()) {
            wrapper.eq(OrderInfo::getStationName, stationName);
        }
        if (expressType != null && !expressType.isBlank()) {
            wrapper.eq(OrderInfo::getExpressType, expressType);
        }
        return orderInfoMapper.selectList(wrapper).stream()
                .map(this::maskSensitiveFields)
                .toList();
    }

    public OrderInfo getOrderDetail(Long orderId, Long currentUserId, boolean isAdmin) {
        OrderInfo order = orderInfoMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (canViewSensitiveFields(order, currentUserId, isAdmin)) {
            return order;
        }
        return maskSensitiveFields(order);
    }

    @Transactional
    public void grabOrder(Long orderId, Long courierId) {
        User courier = userMapper.selectById(courierId);
        if (courier == null || courier.getCourierEnabled() == null || courier.getCourierEnabled() == 0) {
            throw new BusinessException("代取员未认证或被禁用");
        }

        String lockKey = ORDER_GRAB_LOCK_PREFIX + orderId;
        Boolean locked = stringRedisTemplate.opsForValue().setIfAbsent(lockKey, String.valueOf(courierId), 10, TimeUnit.SECONDS);
        if (Boolean.FALSE.equals(locked)) {
            throw new BusinessException("手慢了，订单已经被抢走了");
        }
        try {
            OrderInfo order = orderInfoMapper.selectById(orderId);
            if (order == null) {
                throw new BusinessException("订单不存在");
            }
            if (!OrderStatus.PENDING_GRAB.name().equals(order.getStatus())) {
                if (OrderStatus.GRABBED.name().equals(order.getStatus())) {
                    throw new BusinessException("手慢了，订单已经被抢走了");
                }
                throw new BusinessException("抢单失败，订单不可用");
            }
            int affected = orderInfoMapper.update(null, new LambdaUpdateWrapper<OrderInfo>()
                    .eq(OrderInfo::getId, orderId)
                    .eq(OrderInfo::getVersion, order.getVersion())
                    .set(OrderInfo::getCourierId, courierId)
                    .set(OrderInfo::getStatus, OrderStatus.GRABBED.name())
                    .set(OrderInfo::getVersion, order.getVersion() + 1));
            if (affected == 0) {
                throw new BusinessException("手慢了，订单已经被抢走了");
            }
            noticeService.send(order.getPublisherId(), "ORDER", "订单已被抢", "你的订单已被代取员接单");
            noticeService.send(courierId, "ORDER", "抢单成功", "请及时前往快递站点取件");
        } finally {
            stringRedisTemplate.delete(lockKey);
        }
    }

    @Transactional
    public void updateStatus(Long orderId, Long operatorId, OrderStatus status) {
        OrderInfo order = orderInfoMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        
        // 状态流转验证
        OrderStatus currentStatus = OrderStatus.valueOf(order.getStatus());
        if (!isValidStatusTransition(currentStatus, status)) {
            throw new BusinessException("状态流转不合法");
        }
        
        // 验证操作权限
        if (order.getPublisherId().equals(operatorId)) {
            // 发单用户只能确认关键状态
            if (status != OrderStatus.PICKED_UP && status != OrderStatus.COMPLETED) {
                throw new BusinessException("发单用户无权限执行此操作");
            }
        } else if (order.getCourierId().equals(operatorId)) {
            // 接取用户可以执行所有状态流转
        } else {
            throw new BusinessException("无权限操作此订单");
        }
        
        order.setStatus(status.name());
        
        // 当状态变为DELIVERING时，记录配送完成时间并加入自动确认队列
        if (status == OrderStatus.DELIVERING) {
            order.setDeliveryCompletedAt(LocalDateTime.now());
            // 加入自动确认队列，1小时后自动确认收货
            long autoConfirmAt = LocalDateTime.now().plusHours(1).toEpochSecond(ZoneOffset.ofHours(8));
            stringRedisTemplate.opsForZSet().add(AUTO_CONFIRM_KEY, String.valueOf(orderId), autoConfirmAt);
        }
        
        orderInfoMapper.updateById(order);
        
        if (status == OrderStatus.COMPLETED) {
            int completeScore = creditRuleService.rule("CREDIT_RULE_ORDER_COMPLETE", 2);
            creditService.addCredit(order.getCourierId(), completeScore, "订单完成加分", "CREDIT", orderId);
            // 发送通知
            noticeService.send(order.getPublisherId(), "ORDER", "订单已完成", "请对服务进行评价");
            // 从自动确认队列中移除
            stringRedisTemplate.opsForZSet().remove(AUTO_CONFIRM_KEY, String.valueOf(orderId));
        }
        
        noticeService.send(operatorId, "ORDER", "订单状态更新", "订单状态更新为 " + status.getDesc());
    }
    
    // 状态流转验证
    private boolean isValidStatusTransition(OrderStatus from, OrderStatus to) {
        if (from == OrderStatus.PENDING_GRAB) {
            return to == OrderStatus.GRABBED;
        } else if (from == OrderStatus.GRABBED) {
            return to == OrderStatus.PICKED_UP || to == OrderStatus.DELIVERING;
        } else if (from == OrderStatus.PICKED_UP) {
            return to == OrderStatus.DELIVERING || to == OrderStatus.COMPLETED;
        } else if (from == OrderStatus.DELIVERING) {
            return to == OrderStatus.COMPLETED;
        }
        return false;
    }

    @Transactional
    public void cancelByPublisher(Long orderId, Long publisherId) {
        OrderInfo order = orderInfoMapper.selectById(orderId);
        if (order == null || !publisherId.equals(order.getPublisherId())) {
            throw new BusinessException("订单不存在");
        }
        if (!OrderStatus.PENDING_GRAB.name().equals(order.getStatus())) {
            throw new BusinessException("仅支持取消未抢单订单");
        }
        order.setStatus(OrderStatus.CANCELLED.name());
        order.setCancelReason("用户主动取消");
        order.setCancelType("USER_CANCEL");
        orderInfoMapper.updateById(order);
        stringRedisTemplate.opsForZSet().remove(ORDER_TIMEOUT_KEY, String.valueOf(orderId));
    }

    @Scheduled(cron = "0 */1 * * * ?")
    @Transactional
    public void handleOrderTimeout() {
        long now = LocalDateTime.now().toEpochSecond(ZoneOffset.ofHours(8));
        Set<String> timeoutIds = stringRedisTemplate.opsForZSet().rangeByScore(ORDER_TIMEOUT_KEY, 0, now);
        if (timeoutIds == null || timeoutIds.isEmpty()) {
            return;
        }
        for (String idStr : timeoutIds) {
            Long orderId = Long.valueOf(idStr);
            OrderInfo order = orderInfoMapper.selectById(orderId);
            if (order == null) {
                stringRedisTemplate.opsForZSet().remove(ORDER_TIMEOUT_KEY, idStr);
                continue;
            }
            if (OrderStatus.PENDING_GRAB.name().equals(order.getStatus()) || OrderStatus.GRABBED.name().equals(order.getStatus())) {
                order.setStatus(OrderStatus.CANCELLED.name());
                order.setCancelReason("超时自动取消");
                orderInfoMapper.updateById(order);
                if (order.getCourierId() != null) {
                    int timeoutScore = creditRuleService.rule("CREDIT_RULE_TIMEOUT", -10);
                    creditService.addCredit(order.getCourierId(), timeoutScore, "接单超时扣分", "CREDIT", orderId);
                    noticeService.send(order.getCourierId(), "ORDER", "订单超时取消", "订单超时未完成，已自动取消并扣分");
                }
                noticeService.send(order.getPublisherId(), "ORDER", "订单超时取消", "订单已超时自动取消");
            }
            stringRedisTemplate.opsForZSet().remove(ORDER_TIMEOUT_KEY, idStr);
        }
    }

    @Scheduled(cron = "0 */1 * * * ?")
    @Transactional
    public void handleAutoConfirm() {
        long now = LocalDateTime.now().toEpochSecond(ZoneOffset.ofHours(8));
        Set<String> autoConfirmIds = stringRedisTemplate.opsForZSet().rangeByScore(AUTO_CONFIRM_KEY, 0, now);
        if (autoConfirmIds == null || autoConfirmIds.isEmpty()) {
            return;
        }
        for (String idStr : autoConfirmIds) {
            Long orderId = Long.valueOf(idStr);
            OrderInfo order = orderInfoMapper.selectById(orderId);
            if (order == null) {
                stringRedisTemplate.opsForZSet().remove(AUTO_CONFIRM_KEY, idStr);
                continue;
            }
            if (OrderStatus.DELIVERING.name().equals(order.getStatus())) {
                // 自动确认收货
                order.setStatus(OrderStatus.COMPLETED.name());
                orderInfoMapper.updateById(order);
                
                int completeScore = creditRuleService.rule("CREDIT_RULE_ORDER_COMPLETE", 2);
                creditService.addCredit(order.getCourierId(), completeScore, "订单完成加分", "CREDIT", orderId);
                
                noticeService.send(order.getPublisherId(), "ORDER", "订单已自动确认收货", "由于超时未确认，系统已自动确认收货");
                noticeService.send(order.getCourierId(), "ORDER", "订单已自动确认收货", "订单已自动确认收货完成");
                
                // 自动添加5星好评
                autoSubmitReview(order);
            }
            stringRedisTemplate.opsForZSet().remove(AUTO_CONFIRM_KEY, idStr);
        }
    }

    private void autoSubmitReview(OrderInfo order) {
        // 检查是否已经评价过
        LambdaQueryWrapper<OrderReview> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderReview::getOrderId, order.getId())
               .eq(OrderReview::getReviewerId, order.getPublisherId())
               .last("limit 1");
        
        OrderReview exists = orderReviewMapper.selectOne(wrapper);
        
        if (exists != null) {
            return;
        }
        
        // 创建自动评价
        OrderReview review = new OrderReview();
        review.setOrderId(order.getId());
        review.setReviewerId(order.getPublisherId());
        review.setRevieweeId(order.getCourierId());
        review.setRating(5);
        review.setContent("系统自动评论");
        
        orderReviewMapper.insert(review);
        
        // 标记订单已评价
        order.setHasReview(1);
        orderInfoMapper.updateById(order);
        
        // 添加好评积分
        int score = creditRuleService.rule("CREDIT_RULE_REVIEW_POSITIVE", 2);
        creditService.addCredit(order.getCourierId(), score, "订单评价加分", "CREDIT", order.getId());
        
        // 添加绿色积分
        User courier = userMapper.selectById(order.getCourierId());
        if (courier != null) {
            int greenScore = 1;
            if (courier.getCreditScore() != null && courier.getCreditScore() >= 100) {
                greenScore = 2;
            }
            creditService.addGreenScore(order.getCourierId(), greenScore, "订单完成获得绿色积分", "GREEN", order.getId());
        }
    }

    public List<OrderInfo> myPublishedOrders(Long userId) {
        return orderInfoMapper.selectList(new LambdaQueryWrapper<OrderInfo>()
                .eq(OrderInfo::getPublisherId, userId)
                .orderByDesc(OrderInfo::getCreatedAt));
    }

    public List<OrderInfo> myGrabbedOrders(Long userId) {
        return orderInfoMapper.selectList(new LambdaQueryWrapper<OrderInfo>()
                .eq(OrderInfo::getCourierId, userId)
                .orderByDesc(OrderInfo::getCreatedAt));
    }

    public Map<String, Object> adminOrderList(String status, Integer page, Integer size) {
        Page<OrderInfo> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<OrderInfo> wrapper = new LambdaQueryWrapper<OrderInfo>()
                .orderByDesc(OrderInfo::getCreatedAt);
        if (status != null && !status.isBlank()) {
            wrapper.eq(OrderInfo::getStatus, status);
        }
        Page<OrderInfo> result = orderInfoMapper.selectPage(pageParam, wrapper);
        Map<String, Object> data = new HashMap<>();
        data.put("records", result.getRecords());
        data.put("total", result.getTotal());
        data.put("page", result.getCurrent());
        data.put("size", result.getSize());
        data.put("pages", result.getPages());
        return data;
    }

    public List<OrderInfo> adminOrderList(String status) {
        LambdaQueryWrapper<OrderInfo> wrapper = new LambdaQueryWrapper<OrderInfo>()
                .orderByDesc(OrderInfo::getCreatedAt);
        if (status != null && !status.isBlank()) {
            wrapper.eq(OrderInfo::getStatus, status);
        }
        return orderInfoMapper.selectList(wrapper);
    }

    public Map<String, Object> dashboard() {
        long total = orderInfoMapper.selectCount(new LambdaQueryWrapper<>());
        long completed = orderInfoMapper.selectCount(new LambdaQueryWrapper<OrderInfo>()
            .eq(OrderInfo::getStatus, OrderStatus.COMPLETED.name()));
        long pendingGrab = orderInfoMapper.selectCount(new LambdaQueryWrapper<OrderInfo>()
            .eq(OrderInfo::getStatus, OrderStatus.PENDING_GRAB.name()));
        long toPickup = orderInfoMapper.selectCount(new LambdaQueryWrapper<OrderInfo>()
            .eq(OrderInfo::getStatus, OrderStatus.GRABBED.name()));
        long delivering = orderInfoMapper.selectCount(new LambdaQueryWrapper<OrderInfo>()
            .in(OrderInfo::getStatus, OrderStatus.PICKED_UP.name(), OrderStatus.DELIVERING.name()));
        long appealing = orderInfoMapper.selectCount(new LambdaQueryWrapper<OrderInfo>()
            .eq(OrderInfo::getStatus, OrderStatus.APPEALING.name()));
        long cancelled = orderInfoMapper.selectCount(new LambdaQueryWrapper<OrderInfo>()
            .in(OrderInfo::getStatus, OrderStatus.CANCELLED.name(), "CANCELED"));
        Map<String, Object> result = new HashMap<>();
        result.put("totalOrders", total);
        result.put("completedOrders", completed);
        result.put("pendingGrabOrders", pendingGrab);
        result.put("toPickupOrders", toPickup);
        result.put("deliveringOrders", delivering);
        result.put("appealingOrders", appealing);
        result.put("cancelledOrders", cancelled);
        result.put("completionRate", total == 0 ? 0 : (completed * 100.0 / total));
        return result;
    }

    @Transactional
    public void forceCancel(Long orderId, String reason) {
        OrderInfo order = orderInfoMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        order.setStatus(OrderStatus.CANCELLED.name());
        order.setCancelReason(reason == null || reason.isBlank() ? "管理员强制取消" : reason);
        order.setCancelType("ADMIN_CANCEL");
        orderInfoMapper.updateById(order);
        stringRedisTemplate.opsForZSet().remove(ORDER_TIMEOUT_KEY, String.valueOf(orderId));
        noticeService.send(order.getPublisherId(), "ORDER", "订单被管理员取消", order.getCancelReason());
        if (order.getCourierId() != null) {
            noticeService.send(order.getCourierId(), "ORDER", "订单被管理员取消", order.getCancelReason());
        }
    }

    @Transactional
    public Long republishOrder(Long orderId, Long userId) {
        OrderInfo order = orderInfoMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!order.getPublisherId().equals(userId)) {
            throw new BusinessException("只能重新发布自己的订单");
        }
        if (!OrderStatus.CANCELLED.name().equals(order.getStatus()) && !"CANCELED".equals(order.getStatus())) {
            throw new BusinessException("只能重新发布已取消的订单");
        }
        if (order.getRepublished() != null && order.getRepublished() == 1) {
            throw new BusinessException("该订单已重新发布过，不能重复发布");
        }
        
        OrderInfo newOrder = new OrderInfo();
        newOrder.setPublisherId(order.getPublisherId());
        newOrder.setExpressCompany(order.getExpressCompany());
        newOrder.setExpressNo(order.getExpressNo());
        newOrder.setPickupCode(order.getPickupCode());
        newOrder.setPickupCodeMasked(order.getPickupCodeMasked());
        newOrder.setStationName(order.getStationName());
        newOrder.setExpressType(order.getExpressType());
        newOrder.setPickupTimeRange(order.getPickupTimeRange());
        newOrder.setDeliveryLocation(order.getDeliveryLocation());
        newOrder.setRemark(order.getRemark());
        newOrder.setFee(order.getFee());
        newOrder.setAllowBargain(order.getAllowBargain());
        newOrder.setContactPhone(order.getContactPhone());
        newOrder.setStatus(OrderStatus.PENDING_GRAB.name());
        newOrder.setVersion(0);
        newOrder.setExpireAt(LocalDateTime.now().plusMinutes(60));
        orderInfoMapper.insert(newOrder);
        
        order.setRepublished(1);
        orderInfoMapper.updateById(order);
        
        stringRedisTemplate.opsForZSet().add(ORDER_TIMEOUT_KEY, String.valueOf(newOrder.getId()), newOrder.getExpireAt().toEpochSecond(ZoneOffset.ofHours(8)));
        noticeService.send(userId, "ORDER", "订单重新发布成功", "订单已进入待抢单大厅");
        
        return newOrder.getId();
    }

    public XSSFWorkbook exportOrders(String status) {
        List<OrderInfo> orders = adminOrderList(status);
        XSSFWorkbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("orders");
        String[] headers = {"订单ID", "发单人", "代取员", "快递公司", "快递单号", "站点", "送达地点", "费用", "状态", "取消原因", "创建时间"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
        }
        for (int i = 0; i < orders.size(); i++) {
            OrderInfo order = orders.get(i);
            Row row = sheet.createRow(i + 1);
            row.createCell(0).setCellValue(order.getId() == null ? 0 : order.getId());
            row.createCell(1).setCellValue(order.getPublisherId() == null ? 0 : order.getPublisherId());
            row.createCell(2).setCellValue(order.getCourierId() == null ? 0 : order.getCourierId());
            row.createCell(3).setCellValue(order.getExpressCompany() == null ? "" : order.getExpressCompany());
            row.createCell(4).setCellValue(order.getExpressNo() == null ? "" : order.getExpressNo());
            row.createCell(5).setCellValue(order.getStationName() == null ? "" : order.getStationName());
            row.createCell(6).setCellValue(order.getDeliveryLocation() == null ? "" : order.getDeliveryLocation());
            row.createCell(7).setCellValue(order.getFee() == null ? "0.00" : order.getFee().toString());
            row.createCell(8).setCellValue(order.getStatus() == null ? "" : order.getStatus());
            row.createCell(9).setCellValue(order.getCancelReason() == null ? "" : order.getCancelReason());
            row.createCell(10).setCellValue(order.getCreatedAt() == null ? "" : order.getCreatedAt().toString());
        }
        return workbook;
    }

    private boolean canViewSensitiveFields(OrderInfo order, Long currentUserId, boolean isAdmin) {
        if (isAdmin) {
            return true;
        }
        if (currentUserId == null) {
            return false;
        }
        if (currentUserId.equals(order.getPublisherId())) {
            return true;
        }
        return order.getCourierId() != null && currentUserId.equals(order.getCourierId());
    }

    private OrderInfo maskSensitiveFields(OrderInfo order) {
        OrderInfo masked = new OrderInfo();
        masked.setId(order.getId());
        masked.setPublisherId(order.getPublisherId());
        masked.setCourierId(order.getCourierId());
        masked.setExpressCompany(order.getExpressCompany());
        masked.setExpressNo(MaskUtil.commonMask(order.getExpressNo()));
        masked.setPickupCode(order.getPickupCodeMasked() == null || order.getPickupCodeMasked().isBlank()
                ? MaskUtil.pickupCodeMask(order.getPickupCode())
                : order.getPickupCodeMasked());
        masked.setPickupCodeMasked(order.getPickupCodeMasked());
        masked.setStationName(order.getStationName());
        masked.setExpressType(order.getExpressType());
        masked.setPickupTimeRange(order.getPickupTimeRange());
        masked.setDeliveryLocation(order.getDeliveryLocation());
        masked.setRemark(order.getRemark());
        masked.setFee(order.getFee());
        masked.setAllowBargain(order.getAllowBargain());
        masked.setStatus(order.getStatus());
        masked.setExpireAt(order.getExpireAt());
        masked.setVersion(order.getVersion());
        masked.setCancelReason(order.getCancelReason());
        masked.setCancelType(order.getCancelType());
        masked.setHasReview(order.getHasReview());
        masked.setRepublished(order.getRepublished());
        masked.setContactPhone(MaskUtil.phoneMask(order.getContactPhone()));
        masked.setDeliveryCompletedAt(order.getDeliveryCompletedAt());
        masked.setCreatedAt(order.getCreatedAt());
        masked.setUpdatedAt(order.getUpdatedAt());
        masked.setDeleted(order.getDeleted());
        return masked;
    }
}
