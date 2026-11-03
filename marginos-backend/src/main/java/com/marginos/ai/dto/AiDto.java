package com.marginos.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AiDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AskAiRequest {
        @NotBlank(message = "Question / prompt cannot be blank")
        private String question;

        private String context; // e.g. "DASHBOARD", "PRICING", "INVENTORY", "CASHFLOW"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AskAiResponse {
        private String answer;
        private String provider; // "RULE_BASED_ADVISOR", "LM_STUDIO", "OPENAI"
        private boolean isAiEnabled;
        private List<String> investigatedMetrics;
        private List<String> recommendedActions;
    }
}
