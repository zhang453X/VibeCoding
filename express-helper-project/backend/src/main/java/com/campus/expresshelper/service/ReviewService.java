package com.campus.expresshelper.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.expresshelper.common.BusinessException;
import com.campus.expresshelper.domain.dto.ReviewSubmitRequest;
import com.campus.expresshelper.domain.entity.Appeal;
import com.campus.expresshelper.domain.entity.OrderInfo;
import com.campus.expresshelper.domain.entity.OrderReview;
import com.campus.expresshelper.domain.entity.User;
import com.campus.expresshelper.mapper.AppealMapper;
import com.campus.expresshelper.mapper.OrderInfoMapper;
import com.campus.expresshelper.mapper.OrderReviewMapper;
import com.campus.expresshelper.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final OrderReviewMapper orderReviewMapper;
    private final OrderInfoMapper orderInfoMapper;
    private final UserMapper userMapper;
    private final AppealMapper appealMapper;
    private final CreditService creditService;
    private final CreditRuleService creditRuleService;

    @Transactional
    public Long submit(ReviewSubmitRequest request) {
        OrderInfo order = orderInfoMapper.selectById(request.getOrderId());
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!request.getReviewerId().equals(order.getPublisherId()) && !request.getReviewerId().equals(order.getCourierId())) {
            throw new BusinessException("仅订单双方可评价");
        }
        OrderReview exists = orderReviewMapper.selectOne(new LambdaQueryWrapper<OrderReview>()
                .eq(OrderReview::getOrderId, request.getOrderId())
                .eq(OrderReview::getReviewerId, request.getReviewerId())
                .last("limit 1"));
        if (exists != null) {
            throw new BusinessException("已评价过该订单");
        }
        OrderReview review = new OrderReview();
        review.setOrderId(request.getOrderId());
        review.setReviewerId(request.getReviewerId());
        review.setRevieweeId(request.getRevieweeId());
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        orderReviewMapper.insert(review);

        // 标记订单已评价
        order.setHasReview(1);
        orderInfoMapper.updateById(order);

        if (request.getRating() >= 4) {
            int score = creditRuleService.rule("CREDIT_RULE_REVIEW_POSITIVE", 2);
            creditService.addCredit(request.getRevieweeId(), score, "订单评价加分", "CREDIT", request.getOrderId());
        } else if (request.getRating() <= 2) {
            int score = creditRuleService.rule("CREDIT_RULE_REVIEW_NEGATIVE", -5);
            creditService.addCredit(request.getRevieweeId(), score, "订单差评扣分", "CREDIT", request.getOrderId());
        }

        if (request.getRevieweeId().equals(order.getCourierId())) {
            if (request.getRating() > 2) {
                User courier = userMapper.selectById(request.getRevieweeId());
                if (courier != null) {
                    int greenScore = 1;
                    if (courier.getCreditScore() != null && courier.getCreditScore() >= 100) {
                        greenScore = 2;
                    }
                    creditService.addGreenScore(request.getRevieweeId(), greenScore, "订单完成获得绿色积分", "GREEN", request.getOrderId());
                }
            }
        }
        return review.getId();
    }

    public Object listByOrder(Long orderId) {
        return orderReviewMapper.selectList(new LambdaQueryWrapper<OrderReview>()
                .eq(OrderReview::getOrderId, orderId)
                .orderByAsc(OrderReview::getCreatedAt));
    }

    public Object getReviewForUser(Long orderId, Long userId) {
        return orderReviewMapper.selectOne(new LambdaQueryWrapper<OrderReview>()
                .eq(OrderReview::getOrderId, orderId)
                .eq(OrderReview::getRevieweeId, userId)
                .last("limit 1"));
    }

    public Map<String, Object> reviewCenter(Long userId) {
        List<OrderReview> writtenReviews = orderReviewMapper.selectList(new LambdaQueryWrapper<OrderReview>()
                .eq(OrderReview::getReviewerId, userId)
                .orderByDesc(OrderReview::getCreatedAt));
        List<OrderReview> receivedReviews = orderReviewMapper.selectList(new LambdaQueryWrapper<OrderReview>()
                .eq(OrderReview::getRevieweeId, userId)
                .orderByDesc(OrderReview::getCreatedAt));

        Map<Long, OrderInfo> orderCache = new HashMap<>();
        Map<Long, User> userCache = new HashMap<>();
        Map<String, Appeal> appealCache = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("written", buildReviewList(writtenReviews, true, userId, orderCache, userCache, appealCache));
        data.put("received", buildReviewList(receivedReviews, false, userId, orderCache, userCache, appealCache));
        return data;
    }

    private List<Map<String, Object>> buildReviewList(List<OrderReview> reviews,
                                                      boolean written,
                                                      Long currentUserId,
                                                      Map<Long, OrderInfo> orderCache,
                                                      Map<Long, User> userCache,
                                                      Map<String, Appeal> appealCache) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (OrderReview review : reviews) {
            OrderInfo order = findOrder(orderCache, review.getOrderId());
            Long counterpartId = written ? review.getRevieweeId() : review.getReviewerId();
            User counterpart = findUser(userCache, counterpartId);
            Appeal appeal = written ? null : findAppeal(appealCache, review.getOrderId(), currentUserId);

            Map<String, Object> item = new HashMap<>();
            item.put("id", review.getId());
            item.put("orderId", review.getOrderId());
            item.put("rating", review.getRating());
            item.put("content", review.getContent());
            item.put("createdAt", review.getCreatedAt());
            item.put("counterpartId", counterpartId);
            item.put("counterpartName", displayName(counterpart, counterpartId));
            item.put("stationName", order == null ? "" : order.getStationName());
            item.put("deliveryLocation", order == null ? "" : order.getDeliveryLocation());
            item.put("appealStatus", appeal == null ? "" : appeal.getStatus());
            item.put("appealResult", appeal == null ? "" : appeal.getResult());
            result.add(item);
        }
        return result;
    }

    private OrderInfo findOrder(Map<Long, OrderInfo> orderCache, Long orderId) {
        if (orderId == null) {
            return null;
        }
        if (!orderCache.containsKey(orderId)) {
            orderCache.put(orderId, orderInfoMapper.selectById(orderId));
        }
        return orderCache.get(orderId);
    }

    private User findUser(Map<Long, User> userCache, Long userId) {
        if (userId == null) {
            return null;
        }
        if (!userCache.containsKey(userId)) {
            userCache.put(userId, userMapper.selectById(userId));
        }
        return userCache.get(userId);
    }

    private Appeal findAppeal(Map<String, Appeal> appealCache, Long orderId, Long initiatorId) {
        if (orderId == null || initiatorId == null) {
            return null;
        }
        String key = orderId + "_" + initiatorId;
        if (!appealCache.containsKey(key)) {
            appealCache.put(key, appealMapper.selectOne(new LambdaQueryWrapper<Appeal>()
                    .eq(Appeal::getOrderId, orderId)
                    .eq(Appeal::getInitiatorId, initiatorId)
                    .eq(Appeal::getAppealType, "APPEAL")
                    .orderByDesc(Appeal::getCreatedAt)
                    .last("limit 1")));
        }
        return appealCache.get(key);
    }

    private String displayName(User user, Long userId) {
        if (user == null) {
            return userId == null ? "未知用户" : "用户" + userId;
        }
        if (user.getNickname() != null && !user.getNickname().isBlank()) {
            return user.getNickname();
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        return userId == null ? "未知用户" : "用户" + userId;
    }
}
