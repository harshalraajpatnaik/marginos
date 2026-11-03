package com.marginos.budget.repository;

import com.marginos.budget.model.Forecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ForecastRepository extends JpaRepository<Forecast, UUID> {
    List<Forecast> findByBusinessIdOrderByPeriodStartDesc(UUID businessId);
}
