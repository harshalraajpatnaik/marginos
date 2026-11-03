package com.marginos.workingcapital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class WorkingCapitalDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkingCapitalAnalysisResponse {
        private BigDecimal cashAndBank;
        private BigDecimal accountsReceivable;
        private BigDecimal inventoryValue;
        private BigDecimal totalCurrentAssets;

        private BigDecimal accountsPayable;
        private BigDecimal shortTermLiabilities;
        private BigDecimal totalCurrentLiabilities;

        private BigDecimal netWorkingCapital; // Current Assets - Current Liabilities
        private BigDecimal currentRatio;      // Current Assets / Current Liabilities

        private BigDecimal daysSalesOutstanding;      // DSO (Receivables collection days)
        private BigDecimal daysInventoryOutstanding;  // DIO (Inventory shelf days)
        private BigDecimal daysPayablesOutstanding;   // DPO (Supplier payment days)
        private BigDecimal operatingCycleDays;        // DIO + DSO
        private BigDecimal cashConversionCycleDays;   // DIO + DSO - DPO

        private String healthStatus; // HEALTHY, MODERATE_DEFICIT, CRITICAL_SHORTAGE
        private String plainLanguageAdvice;
    }
}
