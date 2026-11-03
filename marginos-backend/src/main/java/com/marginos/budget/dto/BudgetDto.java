package com.marginos.budget.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class BudgetDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveBudgetRequest {
        @NotNull(message = "Year is required")
        private Integer year;

        @NotNull(message = "Month number (1-12) is required")
        private Integer monthNumber;

        private String name;
        private BigDecimal budgetedRevenue = BigDecimal.ZERO;
        private BigDecimal budgetedCogs = BigDecimal.ZERO;
        private BigDecimal budgetedExpenses = BigDecimal.ZERO;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetVarianceResponse {
        private int year;
        private int monthNumber;
        private String monthName;
        private BigDecimal budgetedRevenue;
        private BigDecimal actualRevenue;
        private BigDecimal revenueVariance;
        private BigDecimal revenueVariancePercent;

        private BigDecimal budgetedExpenses;
        private BigDecimal actualExpenses;
        private BigDecimal expenseVariance;
        private BigDecimal expenseVariancePercent;

        private BigDecimal budgetedProfit;
        private BigDecimal actualProfit;
        private BigDecimal profitVariance;
        private String performanceSummary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnualBudgetComparison {
        private int year;
        private List<BudgetVarianceResponse> monthlyVariances;
        private BigDecimal annualBudgetedRevenue;
        private BigDecimal annualActualRevenue;
        private BigDecimal annualBudgetedExpenses;
        private BigDecimal annualActualExpenses;
    }
}
