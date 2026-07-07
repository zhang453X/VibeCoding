package com.campus.expresshelper.controller;

import com.campus.expresshelper.common.ApiResponse;
import com.campus.expresshelper.domain.dto.FeedbackSubmitRequest;
import com.campus.expresshelper.security.SecurityUtil;
import com.campus.expresshelper.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService feedbackService;

    @PostMapping
    public ApiResponse<Long> submit(@RequestBody @Valid FeedbackSubmitRequest request) {
        Long userId = SecurityUtil.currentUserId();
        return ApiResponse.ok("反馈提交成功", feedbackService.submit(userId, request));
    }
}
