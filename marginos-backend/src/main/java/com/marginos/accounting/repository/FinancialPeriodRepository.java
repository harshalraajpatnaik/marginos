package com.marginos.accounting.repository;

import com.marginos.accounting.model.FinancialPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialPeriodRepository extends JpaRepository<FinancialPeriod, UUID> {
    List<FinancialPeriod> findByFinancialYearIdOrderByPeriodNumberAsc(UUID financialYearId);
    Optional<FinancialPeriod> findByFinancialYearIdAndPeriodNumber(UUID financialYearId, int periodNumber);
    Optional<FinancialPeriod> findFirstByFinancialYearBusinessIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID businessId, LocalDate date1, LocalDate date2);
}
