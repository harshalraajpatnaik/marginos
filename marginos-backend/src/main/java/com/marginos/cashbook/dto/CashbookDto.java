package com.marginos.cashbook.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class CashbookDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveDailyCashbookRequest {
        @NotNull(message = "Entry date is required")
        private LocalDate entryDate;

        private BigDecimal openingCash;
        private BigDecimal cashSales;
        private BigDecimal digitalSales;
        private BigDecimal creditSales;
        private BigDecimal cashPurchases;
        private BigDecimal operatingExpenses;
        private BigDecimal customerCollections;
        private BigDecimal supplierPayments;
        private BigDecimal cashDeposits;
        private BigDecimal cashWithdrawals;
        private BigDecimal ownerCapital;
        private BigDecimal ownerDrawings;
        private BigDecimal loanReceived;
        private BigDecimal loanRepaid;
        private BigDecimal countedCash;
        private BigDecimal estimatedCostOfGoods;
        private String notes;
        private boolean isClosed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashbookEntryResponse {
        private UUID id;
        private LocalDate entryDate;
        private BigDecimal openingCash;
        private BigDecimal cashSales;
        private BigDecimal digitalSales;
        private BigDecimal creditSales;
        private BigDecimal totalSales;
        private BigDecimal cashPurchases;
        private BigDecimal operatingExpenses;
        private BigDecimal customerCollections;
        private BigDecimal supplierPayments;
        private BigDecimal cashDeposits;
        private BigDecimal cashWithdrawals;
        private BigDecimal ownerCapital;
        private BigDecimal ownerDrawings;
        private BigDecimal loanReceived;
        private BigDecimal loanRepaid;
        private BigDecimal calculatedClosingCash;
        private BigDecimal countedCash;
        private BigDecimal cashVariance;
        private BigDecimal estimatedCostOfGoods;
        private BigDecimal estimatedGrossProfit;
        private BigDecimal estimatedGrossMarginPercent;
        private BigDecimal estimatedNetProfit;
        private String notes;
        private boolean isClosed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashSummaryResponse {
        private BigDecimal cashInHand;
        private BigDecimal todaySales;
        private BigDecimal todayExpenses;
        private BigDecimal pendingCollections;
        private BigDecimal pendingSupplierPayments;
        private BigDecimal weeklySalesTotal;
        private BigDecimal weeklyExpenseTotal;
        private List<DailyTrendItem> last7DaysTrend;
        private String whatsappSummaryText;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyTrendItem {
        private LocalDate date;
        private BigDecimal sales;
        private BigDecimal expenses;
        private BigDecimal closingCash;
    }
}
