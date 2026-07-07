package com.campus.expresshelper.controller;

import com.campus.expresshelper.common.ApiResponse;
import com.campus.expresshelper.domain.entity.ExpressStation;
import com.campus.expresshelper.domain.entity.SystemConfig;
import com.campus.expresshelper.security.SecurityUtil;
import com.campus.expresshelper.service.AppealService;
import com.campus.expresshelper.service.AuthService;
import com.campus.expresshelper.service.ExpressStationService;
import com.campus.expresshelper.service.FeedbackService;
import com.campus.expresshelper.service.OrderService;
import com.campus.expresshelper.service.SystemConfigService;
import com.campus.expresshelper.service.UserService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final AuthService authService;
    private final AppealService appealService;
    private final SystemConfigService systemConfigService;
    private final OrderService orderService;
    private final ExpressStationService expressStationService;
    private final FeedbackService feedbackService;

    @GetMapping("/users")
    public ApiResponse<Object> users(@RequestParam(defaultValue = "1") Integer page,
                                      @RequestParam(defaultValue = "20") Integer size) {
        SecurityUtil.assertAdmin();
        return ApiResponse.ok(userService.listAll(page, size));
    }

    @PostMapping("/users/{userId}/freeze")
    public ApiResponse<Void> freeze(@PathVariable Long userId, @RequestParam Integer freezeStatus) {
        SecurityUtil.assertAdmin();
        userService.freeze(userId, freezeStatus);
        return ApiResponse.ok("操作成功", null);
    }

    @PutMapping("/users/{userId}")
    public ApiResponse<Void> updateUser(@PathVariable Long userId, @RequestBody com.campus.expresshelper.domain.entity.User user) {
        SecurityUtil.assertAdmin();
        userService.updateUser(userId, user);
        return ApiResponse.ok("更新成功", null);
    }

    @PostMapping("/users/{userId}/courier")
    public ApiResponse<Void> toggleCourier(@PathVariable Long userId, @RequestParam Integer enabled) {
        SecurityUtil.assertAdmin();
        userService.toggleCourierEnabled(userId, enabled);
        return ApiResponse.ok(enabled == 1 ? "已启用代取员权限" : "已禁用代取员权限", null);
    }

    @PostMapping("/users/{userId}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable Long userId) {
        SecurityUtil.assertAdmin();
        userService.resetPassword(userId);
        return ApiResponse.ok("密码已重置为 123456", null);
    }

    @GetMapping("/auth/pending")
    public ApiResponse<Object> authPending() {
        SecurityUtil.assertAdmin();
        return ApiResponse.ok(authService.pendingList());
    }

    @GetMapping("/auth/all")
    public ApiResponse<Object> authAll(@RequestParam(defaultValue = "1") Integer page,
                                        @RequestParam(defaultValue = "20") Integer size) {
        SecurityUtil.assertAdmin();
        return ApiResponse.ok(authService.allList(page, size));
    }

    @PostMapping("/auth/{authId}/approve")
    public ApiResponse<Void> approve(@PathVariable Long authId) {
        SecurityUtil.assertAdmin();
        authService.approve(authId);
        return ApiResponse.ok("审核通过", null);
    }

    @PostMapping("/auth/{authId}/reject")
    public ApiResponse<Void> reject(@PathVariable Long authId, @RequestParam String reason) {
        SecurityUtil.assertAdmin();
        authService.reject(authId, reason);
        return ApiResponse.ok("已驳回", null);
    }

    @GetMapping("/appeals")
    public ApiResponse<Object> appeals(@RequestParam(defaultValue = "1") Integer page,
                                        @RequestParam(defaultValue = "20") Integer size,
                                        @RequestParam(required = false) String status,
                                        @RequestParam(required = false) String appealType) {
        SecurityUtil.assertAdmin();
        return ApiResponse.ok(appealService.listAll(page, size, status, appealType));
    }

    @GetMapping("/feedbacks")
    public ApiResponse<Object> feedbacks(@RequestParam(defaultValue = "1") Integer page,
                                         @RequestParam(defaultValue = "20") Integer size,
                                         @RequestParam(required = false) Long userId,
                                         @RequestParam(required = false) String feedbackType,
                                         @RequestParam(required = false) String status) {
        SecurityUtil.assertAdmin();
        return ApiResponse.ok(feedbackService.listAll(page, size, userId, feedbackType, status));
    }

    @GetMapping("/orders")
    public ApiResponse<Object> orders(@RequestParam(required = false) String status,
                                       @RequestParam(defaultValue = "1") Integer page,
                                       @RequestParam(defaultValue = "20") Integer size) {
        SecurityUtil.assertAdmin();
        return ApiResponse.ok(orderService.adminOrderList(status, page, size));
    }

    @GetMapping("/dashboard")
    public ApiResponse<Object> dashboard() {
        SecurityUtil.assertAdmin();
        return ApiResponse.ok(orderService.dashboard());
    }

    @PostMapping("/orders/{orderId}/force-cancel")
    public ApiResponse<Void> forceCancel(@PathVariable Long orderId, @RequestParam String reason) {
        SecurityUtil.assertAdmin();
        orderService.forceCancel(orderId, reason);
        return ApiResponse.ok("订单已取消", null);
    }

    @PostMapping("/appeals/{appealId}/resolve")
    public ApiResponse<Void> resolve(@PathVariable Long appealId,
                                     @RequestParam String status,
                                     @RequestParam String result) {
        SecurityUtil.assertAdmin();
        appealService.resolve(appealId, status, result);
        return ApiResponse.ok("处理完成", null);
    }

    @PostMapping("/feedbacks/{feedbackId}/resolve")
    public ApiResponse<Void> resolveFeedback(@PathVariable Long feedbackId,
                                             @RequestParam String reply) {
        SecurityUtil.assertAdmin();
        feedbackService.resolve(feedbackId, SecurityUtil.currentUserId(), reply);
        return ApiResponse.ok("反馈处理完成", null);
    }

    @GetMapping("/configs")
    public ApiResponse<Object> configs() {
        SecurityUtil.assertAdmin();
        return ApiResponse.ok(systemConfigService.list());
    }

    @PostMapping("/configs")
    public ApiResponse<Void> saveConfig(@RequestBody SystemConfig config) {
        SecurityUtil.assertAdmin();
        systemConfigService.save(config);
        return ApiResponse.ok("保存成功", null);
    }

    @DeleteMapping("/configs/{id}")
    public ApiResponse<Void> deleteConfig(@PathVariable Long id) {
        SecurityUtil.assertAdmin();
        systemConfigService.delete(id);
        return ApiResponse.ok("删除成功", null);
    }

    @GetMapping("/stations")
    public ApiResponse<Object> stations() {
        SecurityUtil.assertAdmin();
        return ApiResponse.ok(expressStationService.adminList());
    }

    @PostMapping("/stations")
    public ApiResponse<Void> saveStation(@RequestBody ExpressStation station) {
        SecurityUtil.assertAdmin();
        expressStationService.save(station);
        return ApiResponse.ok("保存成功", null);
    }

    @DeleteMapping("/stations/{id}")
    public ApiResponse<Void> deleteStation(@PathVariable Long id) {
        SecurityUtil.assertAdmin();
        expressStationService.delete(id);
        return ApiResponse.ok("删除成功", null);
    }

    @GetMapping("/orders/export")
    public void exportOrders(@RequestParam(required = false) String status, HttpServletResponse response) throws IOException {
        SecurityUtil.assertAdmin();
        try (XSSFWorkbook workbook = orderService.exportOrders(status)) {
            String filename = URLEncoder.encode("orders.xlsx", StandardCharsets.UTF_8);
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=" + filename);
            workbook.write(response.getOutputStream());
            response.flushBuffer();
        }
    }
}
