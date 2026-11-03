package com.marginos.apikey.controller;

import com.marginos.apikey.dto.ApiKeyDto.*;
import com.marginos.apikey.model.ApiKey;
import com.marginos.apikey.service.ApiKeyService;
import com.marginos.auth.model.User;
import com.marginos.auth.repository.UserRepository;
import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.model.Business;
import com.marginos.business.model.Role;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/api-keys")
@RequiredArgsConstructor
@Tag(name = "API Keys & Developer Platform", description = "Workspace-scoped API key creation (prefix mk_live_...), revocation, rate limiting, and scopes")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;
    private final BusinessService businessService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Generate a new business API key (raw secret is displayed ONLY once)")
    public ResponseEntity<ApiResponse<ApiKeyCreatedResponse>> createApiKey(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateApiKeyRequest request) {
        var membership = businessService.verifyMembership(principal.getId(), businessId);
        if (membership.getRole() != Role.OWNER && membership.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Owner or Admin can generate API keys");
        }

        Business business = membership.getBusiness();
        User user = userRepository.findById(principal.getId()).orElse(null);

        var result = apiKeyService.createApiKey(
                business, user, request.getName(), request.getScopes(), request.getRateLimit(), request.getExpiresAt());

        ApiKeyCreatedResponse resp = ApiKeyCreatedResponse.builder()
                .id(result.apiKey.getId())
                .name(result.apiKey.getName())
                .rawKey(result.rawKey)
                .prefix(result.apiKey.getPrefix())
                .scopes(result.apiKey.getScopes())
                .rateLimit(result.apiKey.getRateLimit())
                .expiresAt(result.apiKey.getExpiresAt())
                .securityNotice("⚠️ Please copy your API key now. For security reasons, it cannot be displayed again.")
                .build();

        return ResponseEntity.ok(ApiResponse.ok("API Key created successfully", resp));
    }

    @GetMapping
    @Operation(summary = "List active and revoked API keys with masked identifiers")
    public ResponseEntity<ApiResponse<List<ApiKeyListItemResponse>>> getApiKeys(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        List<ApiKey> keys = apiKeyService.getApiKeysForBusiness(businessId);

        List<ApiKeyListItemResponse> list = keys.stream()
                .map(k -> ApiKeyListItemResponse.builder()
                        .id(k.getId())
                        .name(k.getName())
                        .maskedKey(k.getPrefix() + "••••••••••••")
                        .scopes(k.getScopes())
                        .rateLimit(k.getRateLimit())
                        .expiresAt(k.getExpiresAt())
                        .isRevoked(k.isRevoked())
                        .lastUsedAt(k.getLastUsedAt())
                        .createdAt(k.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @DeleteMapping("/{apiKeyId}")
    @Operation(summary = "Immediately revoke an API key")
    public ResponseEntity<ApiResponse<Void>> revokeApiKey(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PathVariable UUID apiKeyId) {
        var membership = businessService.verifyMembership(principal.getId(), businessId);
        if (membership.getRole() != Role.OWNER && membership.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Owner or Admin can revoke API keys");
        }

        apiKeyService.revokeApiKey(businessId, apiKeyId);
        return ResponseEntity.ok(ApiResponse.ok("API Key revoked successfully", null));
    }
}
