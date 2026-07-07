package com.campus.expresshelper.controller;

import com.campus.expresshelper.common.ApiResponse;
import com.campus.expresshelper.domain.dto.GrabOrderRequest;
import com.campus.expresshelper.domain.dto.OrderCreateRequest;
import com.campus.expresshelper.domain.enums.OrderStatus;
import com.campus.expresshelper.security.AuthContext;
import com.campus.expresshelper.security.SecurityUtil;
import com.campus.expresshelper.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ApiResponse<Long> create(@RequestBody @Valid OrderCreateRequest request) {
        SecurityUtil.assertSelfOrAdmin(request.getPublisherId());
        return ApiResponse.ok("订单发布成功", orderService.createOrder(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<Object> getOrderDetail(@PathVariable Long id) {
        return ApiResponse.ok(orderService.getOrderDetail(id, SecurityUtil.currentUserId(), AuthContext.isAdmin()));
    }

    @GetMapping("/hall")
    public ApiResponse<Object> hall(@RequestParam(required = false) String stationName,
                                    @RequestParam(required = false) String expressType) {
        return ApiResponse.ok(orderService.listGrabHall(stationName, expressType));
    }

    @PostMapping("/{id}/grab")
    public ApiResponse<Void> grab(@PathVariable Long id, @RequestBody @Valid GrabOrderRequest request) {
        SecurityUtil.assertSelfOrAdmin(request.getCourierId());
        orderService.grabOrder(id, request.getCourierId());
        return ApiResponse.ok("抢单成功", null);
    }

    @PostMapping("/{id}/status")
    public ApiResponse<Void> status(@PathVariable Long id,
                                    @RequestParam Long operatorId,
                                    @RequestParam OrderStatus status) {
        SecurityUtil.assertSelfOrAdmin(operatorId);
        orderService.updateStatus(id, operatorId, status);
        return ApiResponse.ok("状态更新成功", null);
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<Void> cancel(@PathVariable Long id, @RequestParam Long publisherId) {
        SecurityUtil.assertSelfOrAdmin(publisherId);
        orderService.cancelByPublisher(id, publisherId);
        return ApiResponse.ok("取消成功", null);
    }

    @GetMapping("/published/{userId}")
    public ApiResponse<Object> published(@PathVariable Long userId) {
        SecurityUtil.assertSelfOrAdmin(userId);
        return ApiResponse.ok(orderService.myPublishedOrders(userId));
    }

    @GetMapping("/grabbed/{userId}")
    public ApiResponse<Object> grabbed(@PathVariable Long userId) {
        SecurityUtil.assertSelfOrAdmin(userId);
        return ApiResponse.ok(orderService.myGrabbedOrders(userId));
    }

    @PostMapping("/{id}/republish")
    public ApiResponse<Long> republish(@PathVariable Long id, @RequestParam Long publisherId) {
        SecurityUtil.assertSelfOrAdmin(publisherId);
        return ApiResponse.ok("订单重新发布成功", orderService.republishOrder(id, publisherId));
    }
}
