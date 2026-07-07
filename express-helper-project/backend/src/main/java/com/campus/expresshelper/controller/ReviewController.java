package com.campus.expresshelper.controller;

import com.campus.expresshelper.common.ApiResponse;
import com.campus.expresshelper.domain.dto.ReviewSubmitRequest;
import com.campus.expresshelper.security.SecurityUtil;
import com.campus.expresshelper.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public ApiResponse<Long> submit(@RequestBody @Valid ReviewSubmitRequest request) {
        SecurityUtil.assertSelfOrAdmin(request.getReviewerId());
        return ApiResponse.ok("评价成功", reviewService.submit(request));
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<Object> orderReviews(@PathVariable Long orderId) {
        return ApiResponse.ok(reviewService.listByOrder(orderId));
    }

    @GetMapping("/order/{orderId}/for-user/{userId}")
    public ApiResponse<Object> getReviewForUser(@PathVariable Long orderId, @PathVariable Long userId) {
        SecurityUtil.assertSelfOrAdmin(userId);
        return ApiResponse.ok(reviewService.getReviewForUser(orderId, userId));
    }

    @GetMapping("/user/{userId}/center")
    public ApiResponse<Object> reviewCenter(@PathVariable Long userId) {
        SecurityUtil.assertSelfOrAdmin(userId);
        return ApiResponse.ok(reviewService.reviewCenter(userId));
    }
}
