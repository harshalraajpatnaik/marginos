package com.marginos.accounting.repository;

import com.marginos.accounting.model.FinancialYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialYearRepository extends JpaRepository<FinancialYear, UUID> {
    List<FinancialYear> findByBusinessIdOrderByStartDateDesc(UUID businessId);
    Optional<FinancialYear> findByBusinessIdAndName(UUID businessId, String name);
    Optional<FinancialYear> findFirstByBusinessIdAndClosedFalseOrderByStartDateDesc(UUID businessId);
}
