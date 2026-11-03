package com.marginos.apikey.service;

import com.marginos.apikey.model.ApiKey;
import com.marginos.apikey.repository.ApiKeyRepository;
import com.marginos.auth.model.User;
import com.marginos.business.model.Business;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public static class CreatedApiKey {
        public final ApiKey apiKey;
        public final String rawKey;

        public CreatedApiKey(ApiKey apiKey, String rawKey) {
            this.apiKey = apiKey;
            this.rawKey = rawKey;
        }
    }

    @Transactional
    public CreatedApiKey createApiKey(Business business, User user, String name, String scopes, Integer rateLimit, Instant expiresAt) {
        byte[] randomBytes = new byte[24];
        SECURE_RANDOM.nextBytes(randomBytes);
        String randomHex = HexFormat.of().formatHex(randomBytes);
        String rawKey = "mk_live_" + randomHex;
        String prefix = rawKey.substring(0, 14); // "mk_live_" + first 6 chars
        String keyHash = hashKey(rawKey);

        ApiKey apiKey = ApiKey.builder()
                .business(business)
                .name(name)
                .prefix(prefix)
                .keyHash(keyHash)
                .scopes(scopes != null && !scopes.isBlank() ? scopes : "read,write")
                .rateLimit(rateLimit != null ? rateLimit : 120)
                .expiresAt(expiresAt)
                .createdBy(user)
                .build();

        ApiKey saved = apiKeyRepository.save(apiKey);
        return new CreatedApiKey(saved, rawKey);
    }

    @Transactional(readOnly = true)
    public List<ApiKey> getApiKeysForBusiness(UUID businessId) {
        return apiKeyRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
    }

    @Transactional
    public void revokeApiKey(UUID businessId, UUID apiKeyId) {
        ApiKey key = apiKeyRepository.findById(apiKeyId)
                .filter(k -> k.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new IllegalArgumentException("API Key not found"));
        key.setRevoked(true);
        apiKeyRepository.save(key);
    }

    @Transactional
    public Optional<ApiKey> validateAndTouchKey(String rawKey) {
        if (rawKey == null || !rawKey.startsWith("mk_live_")) {
            return Optional.empty();
        }
        String hash = hashKey(rawKey);
        Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByKeyHash(hash);
        if (apiKeyOpt.isPresent()) {
            ApiKey key = apiKeyOpt.get();
            if (key.isValid()) {
                key.setLastUsedAt(Instant.now());
                apiKeyRepository.save(key);
                return Optional.of(key);
            }
        }
        return Optional.empty();
    }

    public static String hashKey(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm missing", e);
        }
    }
}
