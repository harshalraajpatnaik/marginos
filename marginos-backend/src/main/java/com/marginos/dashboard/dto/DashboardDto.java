package com.marginos.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class DashboardDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusinessDashboardSummary {
        private String businessName;
        private String operatingMode;

        // Cash & Liquidity
        private BigDecimal cashInHand;
        private BigDecimal bankBalance;
        private BigDecimal totalCashAvailable;

        // Revenue & Profitability (Month to Date)
        private BigDecimal todaySales;
        private BigDecimal monthToDateSales;
        private BigDecimal monthToDateGrossProfit;
        private BigDecimal monthToDateGrossMarginPercent;
        private BigDecimal monthToDateExpenses;
        private BigDecimal monthToDateNetProfit;

        // Working Capital & Credit
        private BigDecimal pendingReceivables; // Money customers owe
        private BigDecimal pendingPayables;    // Money owed to suppliers
        private BigDecimal netReceivablePayableGap;

        // Inventory health
        private BigDecimal totalInventoryValuation;
        private int lowStockCount;
        private int totalSkus;

        // Trends
        private List<SalesTrendItem> recentSalesTrend;
        private List<ExpenseCategoryItem> topExpenses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesTrendItem {
        private LocalDate date;
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
}
