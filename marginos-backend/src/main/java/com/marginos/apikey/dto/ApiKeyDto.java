package com.marginos.apikey.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

public class ApiKeyDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateApiKeyRequest {
        @NotBlank(message = "API key name is required")
        private String name;

        private String scopes = "read,write";
        private Integer rateLimit = 120; // requests per minute
        private Instant expiresAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiKeyCreatedResponse {
        private UUID id;
        private String name;
        private String rawKey; // Shown ONLY once upon creation!
        private String prefix;
        private String scopes;
        private int rateLimit;
        private Instant expiresAt;
        private String securityNotice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiKeyListItemResponse {
        private UUID id;
        private String name;
        private String maskedKey; // e.g. "mk_live_•••••••3b8f"
        private String scopes;
        private int rateLimit;
        private Instant expiresAt;
        private boolean isRevoked;
        private Instant lastUsedAt;
        private Instant createdAt;
    }
}
