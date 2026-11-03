package com.marginos.pricing.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class PricingDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingCalculationRequest {
        @NotNull(message = "Purchase cost is required")
        private BigDecimal purchaseCost;

        @NotNull(message = "Selling price is required")
        private BigDecimal sellingPrice;

        private BigDecimal packagingCost = BigDecimal.ZERO;
        private BigDecimal transportCost = BigDecimal.ZERO;
        private BigDecimal labourCost = BigDecimal.ZERO;
        private BigDecimal otherVariableCosts = BigDecimal.ZERO;
        private BigDecimal fixedCostAllocation = BigDecimal.ZERO;
        private BigDecimal discountPercent = BigDecimal.ZERO;
        private BigDecimal taxRate = BigDecimal.ZERO;
        private BigDecimal targetMonthlyVolume = new BigDecimal("100");
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingCalculationResponse {
        private BigDecimal purchaseCost;
        private BigDecimal sellingPrice;
        private BigDecimal totalVariableCost;
        private BigDecimal effectiveSellingPriceAfterDiscount;
        private BigDecimal grossProfit;
        private BigDecimal grossMarginPercent;   // (Profit / Price) * 100
        private BigDecimal markupPercent;        // (Profit / Cost) * 100
        private BigDecimal contributionMargin;   // Price - Variable Costs
        private BigDecimal contributionMarginRatio; // (Contribution / Price) * 100
        private BigDecimal netContribution;      // Contribution - Fixed cost allocation
        private BigDecimal minimumViablePrice;   // Floor price to cover all variable + fixed allocation
        private BigDecimal discountImpactOnProfit;
        private String plainLanguageExplanation;
    }
}
