package com.marginos.breakeven.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class BreakEvenDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BreakEvenCalculationRequest {
        @NotNull(message = "Total monthly fixed costs is required")
        private BigDecimal monthlyFixedCosts; // Rent, salaries, power, loan EMI

        @NotNull(message = "Selling price per unit is required")
        private BigDecimal sellingPricePerUnit;

        @NotNull(message = "Variable cost per unit is required")
        private BigDecimal variableCostPerUnit; // Buying price + packing

        private BigDecimal currentMonthlySalesUnits;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BreakEvenCalculationResponse {
        private BigDecimal fixedCosts;
        private BigDecimal sellingPricePerUnit;
        private BigDecimal variableCostPerUnit;
        private BigDecimal contributionPerUnit;
        private BigDecimal contributionMarginRatio;
        private BigDecimal breakevenQuantity;      // Units needed to break even
        private BigDecimal breakevenRevenue;       // Revenue in INR needed to break even
        private BigDecimal dailyBreakevenRevenue;  // Daily sales target assuming 30 days
        private BigDecimal marginOfSafetyUnits;
        private BigDecimal marginOfSafetyPercent;
        private boolean isViable;
        private String message;
        private List<SensitivityItem> sensitivityMatrix;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SensitivityItem {
        private String scenarioName;
        private BigDecimal price;
        private BigDecimal breakevenUnits;
        private BigDecimal breakevenRevenue;
        private String impact;
    }
}
