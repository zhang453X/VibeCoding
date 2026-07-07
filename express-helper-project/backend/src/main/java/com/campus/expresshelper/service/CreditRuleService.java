package com.campus.expresshelper.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreditRuleService {
    private final SystemConfigService systemConfigService;

    public int rule(String key, int defaultValue) {
        String value = systemConfigService.getValue(key);
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (Exception ignored) {
            return defaultValue;
        }
    }
}
