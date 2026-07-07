package com.campus.expresshelper.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppealSubmitRequest {
    @NotNull
    private Long orderId;
    @NotNull
    private Long initiatorId;
    @NotBlank
    private String appealType;
    @NotBlank
    private String description;
    private String evidenceUrls;
}
