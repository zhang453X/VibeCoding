package com.campus.expresshelper.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.expresshelper.common.BusinessException;
import com.campus.expresshelper.domain.dto.AppealSubmitRequest;
import com.campus.expresshelper.domain.entity.Appeal;
import com.campus.expresshelper.domain.entity.OrderInfo;
import com.campus.expresshelper.domain.enums.OrderStatus;
import com.campus.expresshelper.mapper.AppealMapper;
import com.campus.expresshelper.mapper.OrderInfoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AppealService {
    private final AppealMapper appealMapper;
    private final OrderInfoMapper orderInfoMapper;
    private final NoticeService noticeService;

    @Transactional
    public Long submit(AppealSubmitRequest request) {
        OrderInfo order = orderInfoMapper.selectById(request.getOrderId());
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!OrderStatus.COMPLETED.name().equals(order.getStatus()) && !OrderStatus.APPEALING.name().equals(order.getStatus())) {
            throw new BusinessException("当前订单暂不支持提交投诉或申诉");
        }
        validateAppealType(order, request);
        Appeal exists = appealMapper.selectOne(new LambdaQueryWrapper<Appeal>()
                .eq(Appeal::getOrderId, request.getOrderId())
                .eq(Appeal::getInitiatorId, request.getInitiatorId())
                .eq(Appeal::getAppealType, request.getAppealType())
                .last("limit 1"));
        if (exists != null) {
            throw new BusinessException("该类型记录已提交过，请勿重复提交");
        }
        Appeal appeal = new Appeal();
        appeal.setOrderId(request.getOrderId());
        appeal.setInitiatorId(request.getInitiatorId());
        appeal.setAppealType(request.getAppealType());
        appeal.setDescription(request.getDescription());
        appeal.setEvidenceUrls(request.getEvidenceUrls());
        appeal.setStatus("PENDING");
        appealMapper.insert(appeal);
        order.setStatus(OrderStatus.APPEALING.name());
        orderInfoMapper.updateById(order);
        noticeService.send(
                request.getInitiatorId(),
                "APPEAL",
                appealTypeTitle(request.getAppealType()) + "提交成功",
                appealTypeTitle(request.getAppealType()) + "已进入待处理");
        return appeal.getId();
    }

    public Object listByUser(Long userId) {
        return appealMapper.selectList(new LambdaQueryWrapper<Appeal>()
                .eq(Appeal::getInitiatorId, userId)
                .orderByDesc(Appeal::getCreatedAt));
    }

    public Object listAll() {
        return appealMapper.selectList(new LambdaQueryWrapper<Appeal>().orderByDesc(Appeal::getCreatedAt));
    }

    public Map<String, Object> listAll(Integer page, Integer size, String status, String appealType) {
        Page<Appeal> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Appeal> wrapper = new LambdaQueryWrapper<Appeal>()
                .orderByDesc(Appeal::getCreatedAt);
        if (status != null && !status.isBlank()) {
            wrapper.eq(Appeal::getStatus, status);
        }
        if (appealType != null && !appealType.isBlank()) {
            wrapper.eq(Appeal::getAppealType, appealType);
        }
        Page<Appeal> result = appealMapper.selectPage(pageParam, wrapper);
        Map<String, Object> data = new HashMap<>();
        data.put("records", result.getRecords());
        data.put("total", result.getTotal());
        data.put("page", result.getCurrent());
        data.put("size", result.getSize());
        data.put("pages", result.getPages());
        return data;
    }

    @Transactional
    public void resolve(Long appealId, String status, String result) {
        Appeal appeal = appealMapper.selectById(appealId);
        if (appeal == null) {
            throw new BusinessException("申诉记录不存在");
        }
        appeal.setStatus(status);
        appeal.setResult(result);
        appealMapper.updateById(appeal);
        long pendingCount = appealMapper.selectCount(new LambdaQueryWrapper<Appeal>()
                .eq(Appeal::getOrderId, appeal.getOrderId())
                .eq(Appeal::getStatus, "PENDING"));
        if (pendingCount == 0) {
            OrderInfo order = orderInfoMapper.selectById(appeal.getOrderId());
            if (order != null && OrderStatus.APPEALING.name().equals(order.getStatus())) {
                order.setStatus(OrderStatus.COMPLETED.name());
                orderInfoMapper.updateById(order);
            }
        }
        noticeService.send(appeal.getInitiatorId(), "APPEAL", appealTypeTitle(appeal.getAppealType()) + "处理完成", result);
    }

    private void validateAppealType(OrderInfo order, AppealSubmitRequest request) {
        if ("COMPLAINT".equals(request.getAppealType())) {
            if (order.getPublisherId() == null || !order.getPublisherId().equals(request.getInitiatorId())) {
                throw new BusinessException("只有发单人可以投诉代取员");
            }
            return;
        }
        if ("APPEAL".equals(request.getAppealType())) {
            if (order.getCourierId() == null || !order.getCourierId().equals(request.getInitiatorId())) {
                throw new BusinessException("只有代取员可以针对评价发起申诉");
            }
            return;
        }
        throw new BusinessException("不支持的申诉类型");
    }

    private String appealTypeTitle(String appealType) {
        if ("COMPLAINT".equals(appealType)) {
            return "投诉";
        }
        if ("APPEAL".equals(appealType)) {
            return "申诉";
        }
        return "申诉";
    }
}
