package com.campus.expresshelper.controller;

import com.campus.expresshelper.common.ApiResponse;
import com.campus.expresshelper.domain.dto.AppealSubmitRequest;
import com.campus.expresshelper.security.SecurityUtil;
import com.campus.expresshelper.service.AppealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appeal")
@RequiredArgsConstructor
public class AppealController {
    private final AppealService appealService;

    @PostMapping
    public ApiResponse<Long> submit(@RequestBody @Valid AppealSubmitRequest request) {
        SecurityUtil.assertSelfOrAdmin(request.getInitiatorId());
        return ApiResponse.ok("提交成功", appealService.submit(request));
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<Object> listByUser(@PathVariable Long userId) {
        SecurityUtil.assertSelfOrAdmin(userId);
        return ApiResponse.ok(appealService.listByUser(userId));
    }
}
