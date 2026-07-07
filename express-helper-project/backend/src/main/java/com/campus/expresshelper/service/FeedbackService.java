package com.campus.expresshelper.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.expresshelper.common.BusinessException;
import com.campus.expresshelper.domain.dto.FeedbackSubmitRequest;
import com.campus.expresshelper.domain.entity.Feedback;
import com.campus.expresshelper.mapper.FeedbackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private static final Set<String> ALLOWED_FEEDBACK_TYPES = Set.of("BUG", "SUGGESTION", "ACCOUNT", "OTHER");

    private final FeedbackMapper feedbackMapper;
    private final NoticeService noticeService;

    @Transactional
    public Long submit(Long userId, FeedbackSubmitRequest request) {
        if (userId == null) {
            throw new BusinessException("用户未登录");
        }
        if (request == null) {
            throw new BusinessException("反馈信息不能为空");
        }

        String feedbackType = request.getFeedbackType() == null ? "" : request.getFeedbackType().trim();
        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (!ALLOWED_FEEDBACK_TYPES.contains(feedbackType)) {
            throw new BusinessException("反馈类型不正确");
        }
        if (content.isEmpty()) {
            throw new BusinessException("请填写反馈内容");
        }
        if (content.length() > 500) {
            throw new BusinessException("反馈内容不能超过 500 字");
        }

        Feedback feedback = new Feedback();
        feedback.setUserId(userId);
        feedback.setFeedbackType(feedbackType);
        feedback.setContent(content);
        feedback.setStatus("PENDING");
        feedbackMapper.insert(feedback);
        noticeService.send(userId, "FEEDBACK", "反馈提交成功", "你的反馈已提交，管理员处理后会尽快通知你。");
        return feedback.getId();
    }

    public Map<String, Object> listAll(Integer page, Integer size, Long userId, String feedbackType, String status) {
        String feedbackTypeValue = feedbackType == null ? "" : feedbackType.trim();
        String statusValue = status == null ? "" : status.trim();
        Page<Feedback> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Feedback> queryWrapper = new LambdaQueryWrapper<Feedback>()
                .eq(userId != null, Feedback::getUserId, userId)
                .eq(!feedbackTypeValue.isEmpty(), Feedback::getFeedbackType, feedbackTypeValue)
                .eq(!statusValue.isEmpty(), Feedback::getStatus, statusValue)
                .orderByDesc(Feedback::getCreatedAt);
        Page<Feedback> result = feedbackMapper.selectPage(pageParam,
                queryWrapper);
        Map<String, Object> data = new HashMap<>();
        data.put("records", result.getRecords());
        data.put("total", result.getTotal());
        data.put("page", result.getCurrent());
        data.put("size", result.getSize());
        data.put("pages", result.getPages());
        return data;
    }

    @Transactional
    public void resolve(Long feedbackId, Long adminId, String reply) {
        Feedback feedback = feedbackMapper.selectById(feedbackId);
        if (feedback == null || Integer.valueOf(1).equals(feedback.getDeleted())) {
            throw new BusinessException("反馈记录不存在");
        }

        String replyText = reply == null ? "" : reply.trim();
        if (replyText.isEmpty()) {
            throw new BusinessException("请输入处理结果");
        }
        if (replyText.length() > 500) {
            throw new BusinessException("处理结果不能超过 500 字");
        }

        feedback.setStatus("PROCESSED");
        feedback.setReply(replyText);
        feedback.setHandledBy(adminId);
        feedback.setHandledAt(LocalDateTime.now());
        feedbackMapper.updateById(feedback);
        noticeService.send(feedback.getUserId(), "FEEDBACK", "反馈处理完成", replyText);
    }
}
