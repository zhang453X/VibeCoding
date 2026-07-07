package com.campus.expresshelper.domain.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderCreateRequest {
    @NotNull
    private Long publisherId;
    @NotBlank
    private String expressCompany;
    @NotBlank
    private String expressNo;
    @NotBlank
    private String pickupCode;
    @NotBlank
    private String stationName;
    @NotBlank
    private String expressType;
    @NotBlank
    private String pickupTimeRange;
    @NotBlank
    private String deliveryLocation;
    private String remark;
    @NotNull
    @DecimalMin(value = "0.1")
    private BigDecimal fee;
    @NotNull
    private Integer allowBargain;
    @NotNull
    private Integer validMinutes;
    private String contactPhone;
}
