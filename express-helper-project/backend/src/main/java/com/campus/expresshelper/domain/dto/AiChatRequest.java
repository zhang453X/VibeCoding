package com.campus.expresshelper.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class AiChatRequest {
    @NotBlank(message = "咨询内容不能为空")
    private String message;

    private List<HistoryMessage> history;

    @Data
    public static class HistoryMessage {
        private String role;
        private String content;
    }
}
