package com.campus.expresshelper.domain.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewSubmitRequest {
    @NotNull
    private Long orderId;
    @NotNull
    private Long reviewerId;
    @NotNull
    private Long revieweeId;
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
    private String content;
}
