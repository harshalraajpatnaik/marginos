package com.marginos.accounting.dto;

import com.marginos.accounting.model.AccountType;
import com.marginos.accounting.model.JournalStatus;
import com.marginos.accounting.model.NormalBalance;
import com.marginos.accounting.model.SourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class AccountingDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateAccountRequest {
        @NotBlank(message = "Code is required")
        private String code;

        @NotBlank(message = "Name is required")
        private String name;

        @NotNull(message = "Account type is required")
        private AccountType accountType;

        @NotBlank(message = "Sub-category is required")
        private String subCategory;

        private NormalBalance normalBalance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountDto {
        private UUID id;
        private String code;
        private String name;
        private AccountType accountType;
        private String subCategory;
        private NormalBalance normalBalance;
        private BigDecimal currentBalance;
        private boolean system;
        private boolean active;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateJournalEntryRequest {
        @NotNull(message = "Entry date is required")
        private LocalDate entryDate;

        private String referenceNo;

        @NotBlank(message = "Description is required")
        private String description;

        private SourceType sourceType = SourceType.MANUAL;

        @NotEmpty(message = "Lines cannot be empty")
        private List<JournalLineRequest> lines;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JournalLineRequest {
        @NotNull(message = "Account ID is required")
        private UUID accountId;

        private BigDecimal debitAmount = BigDecimal.ZERO;
        private BigDecimal creditAmount = BigDecimal.ZERO;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JournalEntryDto {
        private UUID id;
        private String entryNumber;
        private LocalDate entryDate;
        private LocalDate postingDate;
        private String referenceNo;
        private String description;
        private JournalStatus status;
        private SourceType sourceType;
        private List<JournalLineDto> lines;
        private BigDecimal totalDebit;
        private BigDecimal totalCredit;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JournalLineDto {
        private UUID id;
        private UUID accountId;
        private String accountCode;
        private String accountName;
        private AccountType accountType;
        private BigDecimal debitAmount;
        private BigDecimal creditAmount;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrialBalanceItem {
        private String accountCode;
        private String accountName;
        private AccountType accountType;
        private BigDecimal debitBalance;
        private BigDecimal creditBalance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrialBalanceReport {
        private LocalDate asOfDate;
        private List<TrialBalanceItem> items;
        private BigDecimal totalDebit;
        private BigDecimal totalCredit;
        private boolean isBalanced;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfitLossReport {
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal salesRevenue;
        private BigDecimal costOfGoodsSold;
        private BigDecimal grossProfit;
        private BigDecimal grossMarginPercent;
        private List<ExpenseCategoryItem> operatingExpenses;
        private BigDecimal totalOperatingExpenses;
        private BigDecimal operatingProfit; // EBITDA
        private BigDecimal interestExpense;
        private BigDecimal netProfit;
        private BigDecimal netMarginPercent;
        private boolean isAudited;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BalanceSheetReport {
        private LocalDate asOfDate;
        private List<BalanceSheetItem> currentAssets;
        private BigDecimal totalCurrentAssets;
        private List<BalanceSheetItem> nonCurrentAssets;
        private BigDecimal totalNonCurrentAssets;
        private BigDecimal totalAssets;

        private List<BalanceSheetItem> currentLiabilities;
        private BigDecimal totalCurrentLiabilities;
        private List<BalanceSheetItem> nonCurrentLiabilities;
        private BigDecimal totalNonCurrentLiabilities;
        private BigDecimal totalLiabilities;

        private List<BalanceSheetItem> equityItems;
        private BigDecimal netIncomeRetained;
        private BigDecimal totalEquity;

        private BigDecimal totalLiabilitiesAndEquity;
        private boolean isBalanced;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BalanceSheetItem {
        private String accountCode;
        private String accountName;
        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseCategoryItem {
        private String category;
        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashFlowReport {
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal netIncome;
        private BigDecimal operatingInflow;
        private BigDecimal operatingOutflow;
        private BigDecimal netOperatingCash;
        private BigDecimal operatingCashFlow;
        private BigDecimal investingCashFlow;
        private BigDecimal financingInflow;
        private BigDecimal financingOutflow;
        private BigDecimal financingCashFlow;
        private BigDecimal netCashChange;
        private BigDecimal openingCash;
        private BigDecimal closingCash;
    }
}
