package com.marginos.expense.repository;

import com.marginos.expense.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    Page<Expense> findByBusinessIdOrderByExpenseDateDescCreatedAtDesc(UUID businessId, Pageable pageable);
    List<Expense> findByBusinessIdAndExpenseDateBetween(UUID businessId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.business.id = :businessId AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumExpensesBetween(UUID businessId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.business.id = :businessId")
    BigDecimal sumTotalExpenses(UUID businessId);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.business.id = :businessId AND e.expenseDate BETWEEN :startDate AND :endDate GROUP BY e.category")
    List<Object[]> sumExpensesByCategory(UUID businessId, LocalDate startDate, LocalDate endDate);
}
