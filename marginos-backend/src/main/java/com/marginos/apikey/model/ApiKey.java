package com.marginos.apikey.model;

import com.marginos.auth.model.User;
import com.marginos.business.model.Business;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "api_keys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "key_hash", nullable = false, unique = true)
    private String keyHash;

    @Column(nullable = false, length = 20)
    private String prefix; // e.g. "mk_live_abc123"

    @Column(nullable = false, length = 500)
    @Builder.Default
    private String scopes = "read,write";

    @Column(name = "rate_limit", nullable = false)
    @Builder.Default
    private int rateLimit = 120; // requests per minute

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "is_revoked", nullable = false)
    @Builder.Default
    private boolean revoked = false;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public boolean isValid() {
        if (revoked) return false;
        if (expiresAt != null && expiresAt.isBefore(Instant.now())) return false;
        return true;
    }
}
