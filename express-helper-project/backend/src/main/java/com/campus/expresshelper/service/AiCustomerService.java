package com.campus.expresshelper.service;

import com.campus.expresshelper.common.BusinessException;
import com.campus.expresshelper.domain.dto.AiChatRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiCustomerService {
    private static final String AI_CUSTOMER_ENABLED = "AI_CUSTOMER_ENABLED";
    private static final String AI_OPENAI_BASE_URL = "AI_OPENAI_BASE_URL";
    private static final String AI_OPENAI_API_KEY = "AI_OPENAI_API_KEY";
    private static final String AI_OPENAI_MODEL = "AI_OPENAI_MODEL";
    private static final String AI_CUSTOMER_SYSTEM_PROMPT = "AI_CUSTOMER_SYSTEM_PROMPT";
    private static final int MAX_HISTORY_MESSAGES = 10;

    private final SystemConfigService systemConfigService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public Map<String, Object> chat(Long userId, AiChatRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().isBlank()) {
            throw new BusinessException("咨询内容不能为空");
        }
        if (!isEnabled()) {
            throw new BusinessException("AI客服暂未开启");
        }

        String baseUrl = requireConfig(AI_OPENAI_BASE_URL, "请先在系统参数中配置 AI_OPENAI_BASE_URL");
        String apiKey = requireConfig(AI_OPENAI_API_KEY, "请先在系统参数中配置 AI_OPENAI_API_KEY");
        String model = requireConfig(AI_OPENAI_MODEL, "请先在系统参数中配置 AI_OPENAI_MODEL");
        String systemPrompt = systemConfigService.getValue(AI_CUSTOMER_SYSTEM_PROMPT);
        if (systemPrompt.isBlank()) {
            systemPrompt = defaultSystemPrompt();
        }

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.set("messages", buildMessages(systemPrompt, request));

        String reply = requestOpenAi(normalizeBaseUrl(baseUrl), normalizeApiKey(apiKey), payload);
        return Map.of(
                "reply", reply,
                "model", model,
                "userId", userId
        );
    }

    private boolean isEnabled() {
        String enabled = systemConfigService.getValue(AI_CUSTOMER_ENABLED);
        return "1".equals(enabled) || "true".equalsIgnoreCase(enabled);
    }

    private String requireConfig(String key, String message) {
        String value = systemConfigService.getValue(key);
        if (value == null || value.isBlank()) {
            throw new BusinessException(message);
        }
        return sanitizeConfigValue(value);
    }

    private ArrayNode buildMessages(String systemPrompt, AiChatRequest request) {
        ArrayNode messages = objectMapper.createArrayNode();
        messages.add(buildMessage("system", systemPrompt));

        List<AiChatRequest.HistoryMessage> history = request.getHistory();
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - MAX_HISTORY_MESSAGES);
            for (int i = start; i < history.size(); i++) {
                AiChatRequest.HistoryMessage item = history.get(i);
                if (item == null || item.getContent() == null || item.getContent().isBlank()) {
                    continue;
                }
                String role = normalizeRole(item.getRole());
                messages.add(buildMessage(role, item.getContent().trim()));
            }
        }

        messages.add(buildMessage("user", request.getMessage().trim()));
        return messages;
    }

    private ObjectNode buildMessage(String role, String content) {
        ObjectNode message = objectMapper.createObjectNode();
        message.put("role", role);
        message.put("content", content);
        return message;
    }

    private String normalizeRole(String role) {
        if ("assistant".equalsIgnoreCase(role)) {
            return "assistant";
        }
        return "user";
    }

    private String requestOpenAi(String baseUrl, String apiKey, ObjectNode payload) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/chat/completions"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new BusinessException("AI客服调用失败：" + extractErrorMessage(response.body(), response.statusCode()));
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = extractContent(root.path("choices").path(0).path("message").path("content"));
            if (content == null || content.isBlank()) {
                throw new BusinessException("AI客服暂时没有返回有效内容");
            }
            return content.trim();
        } catch (BusinessException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("AI客服暂时不可用，请稍后重试");
        } catch (IOException e) {
            throw new BusinessException("AI客服暂时不可用，请稍后重试");
        } catch (Exception e) {
            throw new BusinessException("AI客服暂时不可用，请检查系统参数配置");
        }
    }

    private String extractErrorMessage(String responseBody, int statusCode) {
        if (responseBody == null || responseBody.isBlank()) {
            return "HTTP " + statusCode + "，请检查接口地址、模型或密钥配置";
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String message = root.path("error").path("message").asText("");
            if (message.isBlank()) {
                message = root.path("message").asText("");
            }
            if (!message.isBlank()) {
                return message.trim();
            }
        } catch (Exception ignored) {
            // Ignore parse error and fallback to raw response body.
        }
        String text = responseBody.trim();
        if (text.length() > 200) {
            text = text.substring(0, 200) + "...";
        }
        return text;
    }

    private String extractContent(JsonNode contentNode) {
        if (contentNode == null || contentNode.isMissingNode() || contentNode.isNull()) {
            return "";
        }
        if (contentNode.isTextual()) {
            return contentNode.asText();
        }
        if (contentNode.isArray()) {
            StringBuilder builder = new StringBuilder();
            for (JsonNode item : contentNode) {
                if (item.path("text").isTextual()) {
                    builder.append(item.path("text").asText());
                } else if (item.path("type").asText("").equals("text") && item.path("content").isTextual()) {
                    builder.append(item.path("content").asText());
                }
            }
            return builder.toString();
        }
        return contentNode.toString();
    }

    private String normalizeBaseUrl(String baseUrl) {
        String trimmed = sanitizeConfigValue(baseUrl);
        if (trimmed.endsWith("/chat/completions")) {
            trimmed = trimmed.substring(0, trimmed.length() - "/chat/completions".length());
        }
        if (trimmed.endsWith("/")) {
            return trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    private String normalizeApiKey(String apiKey) {
        String normalized = sanitizeConfigValue(apiKey);
        if (normalized.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return normalized.substring(7).trim();
        }
        return normalized;
    }

    private String sanitizeConfigValue(String value) {
        String sanitized = value == null ? "" : value.trim();
        while (sanitized.length() >= 2) {
            char first = sanitized.charAt(0);
            char last = sanitized.charAt(sanitized.length() - 1);
            boolean wrappedByQuote = (first == '"' && last == '"')
                    || (first == '\'' && last == '\'')
                    || (first == '`' && last == '`');
            if (!wrappedByQuote) {
                break;
            }
            sanitized = sanitized.substring(1, sanitized.length() - 1).trim();
        }
        return sanitized;
    }

    private String defaultSystemPrompt() {
        return """
                你是“校园快递互助”小程序里的AI客服助手。
                你的职责是帮助用户解答本系统相关问题，包括：下单、抢单、订单状态、评价、申诉、实名认证、快递点、系统参数相关说明。
                请遵守以下要求：
                1. 仅回答本项目业务相关问题，保持简洁、友好、清晰。
                2. 不要编造后台不存在的功能或规则，不确定时明确说明“以页面实际显示和管理员配置为准”。
                3. 不要索取密码、验证码、完整身份证号、完整取件码等敏感信息。
                4. 如果用户问的是操作步骤，尽量给出分步说明。
                5. 如果用户反馈异常，优先建议检查网络、实名认证状态、订单状态或联系管理员。
                """;
    }
}
