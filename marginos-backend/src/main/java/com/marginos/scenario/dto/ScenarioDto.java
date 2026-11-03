package com.marginos.scenario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

public class ScenarioDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimulateScenarioRequest {
        @NotBlank(message = "Scenario name is required")
        private String name;

        private String description;

        // Baseline (if not provided, automatically populated from current business ledger)
        private BigDecimal baseMonthlyRevenue;
        private BigDecimal baseGrossMarginPercent;
        private BigDecimal baseMonthlyFixedCosts;

        // Hypothetical adjustments
        private BigDecimal salesChangePercent = BigDecimal.ZERO;    // e.g. +15% or -10%
        private BigDecimal costChangePercent = BigDecimal.ZERO;     // e.g. +5% purchase price increase
        private BigDecimal rentChange = BigDecimal.ZERO;            // e.g. +5000 Rs
        private BigDecimal salaryChange = BigDecimal.ZERO;          // e.g. +8000 Rs for new helper
        private BigDecimal newLoanAmount = BigDecimal.ZERO;         // e.g. 200000 Rs
        private BigDecimal newLoanInterestRate = BigDecimal.ZERO;   // e.g. 14%
        private int newLoanTenureMonths = 0;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScenarioComparisonResponse {
        private UUID id;
        private String name;
        private String description;

        // Baseline
        private BigDecimal baseMonthlyRevenue;
        private BigDecimal baseGrossProfit;
        private BigDecimal baseOperatingProfit;
        private BigDecimal baseBreakevenRevenue;

        // Projected (Hypothetical)
        private BigDecimal projectedRevenue;
        private BigDecimal projectedGrossProfit;
        private BigDecimal projectedGrossMarginPercent;
        private BigDecimal projectedOperatingProfit;
        private BigDecimal projectedBreakevenRevenue;
        private BigDecimal projectedLoanEmi;

        // Deltas (Impact)
        private BigDecimal revenueDelta;
        private BigDecimal profitDelta;
        private BigDecimal breakevenDelta;

        private boolean isHypothetical;
        private String businessInsight;
    }
}
