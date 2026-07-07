package com.campus.expresshelper.controller;

import com.campus.expresshelper.common.ApiResponse;
import com.campus.expresshelper.domain.dto.AiChatRequest;
import com.campus.expresshelper.domain.entity.User;
import com.campus.expresshelper.security.SecurityUtil;
import com.campus.expresshelper.service.AiCustomerService;
import com.campus.expresshelper.service.CreditService;
import com.campus.expresshelper.service.NoticeService;
import com.campus.expresshelper.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final CreditService creditService;
    private final NoticeService noticeService;
    private final AiCustomerService aiCustomerService;

    @PostMapping("/register")
    public ApiResponse<User> register(@RequestBody @Valid User user) {
        return ApiResponse.ok(userService.register(user));
    }

    @GetMapping("/{id}/profile")
    public ApiResponse<User> profile(@PathVariable Long id) {
        SecurityUtil.assertSelfOrAdmin(id);
        return ApiResponse.ok(userService.profile(id));
    }

    @GetMapping("/{id}/credits")
    public ApiResponse<Object> credits(@PathVariable Long id) {
        SecurityUtil.assertSelfOrAdmin(id);
        return ApiResponse.ok(creditService.listUserCredits(id));
    }

    @GetMapping("/{id}/notices")
    public ApiResponse<Object> notices(@PathVariable Long id) {
        SecurityUtil.assertSelfOrAdmin(id);
        return ApiResponse.ok(noticeService.userNotices(id));
    }

    @GetMapping("/{id}/notices/unread-count")
    public ApiResponse<Long> unreadCount(@PathVariable Long id) {
        SecurityUtil.assertSelfOrAdmin(id);
        return ApiResponse.ok(noticeService.unreadCount(id));
    }

    @PostMapping("/{id}/notices/{noticeId}/read")
    public ApiResponse<Void> readOne(@PathVariable Long id, @PathVariable Long noticeId) {
        SecurityUtil.assertSelfOrAdmin(id);
        noticeService.readOne(id, noticeId);
        return ApiResponse.ok("已读", null);
    }

    @PostMapping("/{id}/notices/{noticeId}/unread")
    public ApiResponse<Void> unreadOne(@PathVariable Long id, @PathVariable Long noticeId) {
        SecurityUtil.assertSelfOrAdmin(id);
        noticeService.unreadOne(id, noticeId);
        return ApiResponse.ok("已标记未读", null);
    }

    @PostMapping("/{id}/notices/read-all")
    public ApiResponse<Void> readAll(@PathVariable Long id) {
        SecurityUtil.assertSelfOrAdmin(id);
        noticeService.readAll(id);
        return ApiResponse.ok("全部已读", null);
    }

    @DeleteMapping("/{id}/notices/{noticeId}")
    public ApiResponse<Void> deleteOne(@PathVariable Long id, @PathVariable Long noticeId) {
        SecurityUtil.assertSelfOrAdmin(id);
        noticeService.deleteOne(id, noticeId);
        return ApiResponse.ok("删除成功", null);
    }

    @PostMapping("/{id}/ai-chat")
    public ApiResponse<Object> aiChat(@PathVariable Long id, @RequestBody @Valid AiChatRequest request) {
        SecurityUtil.assertSelfOrAdmin(id);
        return ApiResponse.ok(aiCustomerService.chat(id, request));
    }
    
    @PutMapping("/{id}")
    public ApiResponse<Void> updateProfile(@PathVariable Long id, @RequestBody User user) {
        SecurityUtil.assertSelfOrAdmin(id);
        userService.updateProfile(id, user);
        return ApiResponse.ok("修改成功", null);
    }
    
    @PutMapping("/{id}/password")
    public ApiResponse<Void> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> passwordMap) {
        SecurityUtil.assertSelfOrAdmin(id);
        String oldPassword = passwordMap.get("oldPassword");
        String newPassword = passwordMap.get("newPassword");
        userService.updatePassword(id, oldPassword, newPassword);
        return ApiResponse.ok("修改成功", null);
    }
}
