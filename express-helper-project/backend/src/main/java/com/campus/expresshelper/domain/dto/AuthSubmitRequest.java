package com.campus.expresshelper.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AuthSubmitRequest {
    @NotNull
    private Long userId;
    @NotBlank
    private String studentNo;
    @NotBlank
    private String realName;
    @NotBlank
    private String idCardFrontUrl;
    @NotBlank
    private String idCardBackUrl;
    @NotBlank
    private String idCardWithStudentCardUrl;
}
