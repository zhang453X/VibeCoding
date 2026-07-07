package com.campus.expresshelper.domain.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GrabOrderRequest {
    @NotNull
    private Long courierId;
}
