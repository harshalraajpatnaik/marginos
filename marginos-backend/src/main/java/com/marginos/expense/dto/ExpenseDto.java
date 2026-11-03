package com.marginos.expense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ExpenseDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateExpenseRequest {
        @NotNull(message = "Expense date is required")
        private LocalDate expenseDate;

        @NotBlank(message = "Category is required")
        private String category; // RENT, SALARIES, UTILITIES, TRANSPORT, MARKETING, PACKAGING, REPAIRS, INTEREST, TAXES, OTHER

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Amount is required")
        private BigDecimal amount;

        private String paymentMode = "CASH"; // CASH, UPI, BANK_TRANSFER
        private String vendorName;
        private boolean recurring = false;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseResponse {
        private UUID id;
        private LocalDate expenseDate;
        private String category;
        private String description;
        private BigDecimal amount;
        private String paymentMode;
        private String vendorName;
        private boolean recurring;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseCategorySummary {
        private String category;
        private BigDecimal totalAmount;
        private BigDecimal percentageOfTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseBreakdownReport {
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal totalExpenses;
        private List<ExpenseCategorySummary> categories;
    }
}
