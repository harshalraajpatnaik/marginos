package com.marginos.scenario.repository;

import com.marginos.scenario.model.Scenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScenarioRepository extends JpaRepository<Scenario, UUID> {
    List<Scenario> findByBusinessIdOrderByCreatedAtDesc(UUID businessId);
}
