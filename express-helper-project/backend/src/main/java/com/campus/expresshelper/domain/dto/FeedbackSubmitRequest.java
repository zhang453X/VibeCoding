package com.campus.expresshelper.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FeedbackSubmitRequest {
    @NotBlank
    private String feedbackType;

    @NotBlank
    private String content;
}
