package com.marginos.apikey.repository;

import com.marginos.apikey.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {
    List<ApiKey> findByBusinessIdOrderByCreatedAtDesc(UUID businessId);
    Optional<ApiKey> findByKeyHash(String keyHash);
}
