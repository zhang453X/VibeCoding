package com.campus.expresshelper.controller;

import com.campus.expresshelper.common.ApiResponse;
import com.campus.expresshelper.domain.dto.AuthSubmitRequest;
import com.campus.expresshelper.domain.dto.LoginRequest;
import com.campus.expresshelper.security.SecurityUtil;
import com.campus.expresshelper.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<Object> login(@RequestBody @Valid LoginRequest request) {
        return ApiResponse.ok("登录成功", authService.login(request));
    }

    @PostMapping("/submit")
    public ApiResponse<Void> submit(@RequestBody @Valid AuthSubmitRequest request) {
        SecurityUtil.assertSelfOrAdmin(request.getUserId());
        authService.submit(request);
        return ApiResponse.ok("提交成功", null);
    }

    @GetMapping("/latest/{userId}")
    public ApiResponse<Object> latest(@PathVariable Long userId) {
        SecurityUtil.assertSelfOrAdmin(userId);
        return ApiResponse.ok(authService.latestByUser(userId));
    }
}
