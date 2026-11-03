package com.marginos.budget.repository;

import com.marginos.budget.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    List<Budget> findByBusinessIdAndYearOrderByMonthNumberAsc(UUID businessId, int year);
    Optional<Budget> findByBusinessIdAndYearAndMonthNumber(UUID businessId, int year, int monthNumber);
}
