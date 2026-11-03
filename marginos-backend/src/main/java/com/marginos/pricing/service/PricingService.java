package com.marginos.pricing.service;

import com.marginos.common.MoneyUtils;
import com.marginos.pricing.dto.PricingDto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
public class PricingService {

    public PricingCalculationResponse calculatePricing(PricingCalculationRequest req) {
        BigDecimal purchaseCost = req.getPurchaseCost() != null ? req.getPurchaseCost() : BigDecimal.ZERO;
        BigDecimal sellingPrice = req.getSellingPrice() != null ? req.getSellingPrice() : BigDecimal.ZERO;

        BigDecimal packaging = req.getPackagingCost() != null ? req.getPackagingCost() : BigDecimal.ZERO;
        BigDecimal transport = req.getTransportCost() != null ? req.getTransportCost() : BigDecimal.ZERO;
        BigDecimal labour = req.getLabourCost() != null ? req.getLabourCost() : BigDecimal.ZERO;
        BigDecimal otherVar = req.getOtherVariableCosts() != null ? req.getOtherVariableCosts() : BigDecimal.ZERO;
        BigDecimal fixedAlloc = req.getFixedCostAllocation() != null ? req.getFixedCostAllocation() : BigDecimal.ZERO;
        BigDecimal discountPct = req.getDiscountPercent() != null ? req.getDiscountPercent() : BigDecimal.ZERO;

        BigDecimal totalVarCost = purchaseCost.add(packaging).add(transport).add(labour).add(otherVar);

        // Effective selling price after discount
        BigDecimal discountAmount = sellingPrice.multiply(discountPct).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
        BigDecimal effectiveSellingPrice = sellingPrice.subtract(discountAmount);

        // Gross Profit (using base purchase cost vs nominal selling price)
        BigDecimal grossProfit = effectiveSellingPrice.subtract(purchaseCost);

        // Gross Margin = (Gross Profit / Effective Selling Price) * 100
        BigDecimal grossMarginPct = effectiveSellingPrice.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.multiply(new BigDecimal("100")).divide(effectiveSellingPrice, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Markup = (Gross Profit / Purchase Cost) * 100
        BigDecimal markupPct = purchaseCost.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.multiply(new BigDecimal("100")).divide(purchaseCost, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Contribution Margin = Effective Selling Price - Total Variable Costs
        BigDecimal contributionMargin = effectiveSellingPrice.subtract(totalVarCost);
        BigDecimal contributionRatio = effectiveSellingPrice.compareTo(BigDecimal.ZERO) > 0
                ? contributionMargin.multiply(new BigDecimal("100")).divide(effectiveSellingPrice, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Net Contribution = Contribution Margin - Fixed Cost Allocation
        BigDecimal netContribution = contributionMargin.subtract(fixedAlloc);

        // Minimum Viable Price = Total Variable Costs + Fixed Cost Allocation
        BigDecimal minViablePrice = totalVarCost.add(fixedAlloc);

        // Plain language explanation for shopkeepers
        String explanation = String.format(
                "💡 **Margin vs. Markup Explained:**\n" +
                "- **Markup (%s%%)**: You are adding %s%% on top of what you paid for the product (%s).\n" +
                "- **Margin (%s%%)**: Out of every ₹100 a customer hands you, you keep %s as gross profit.\n" +
                "- Total variable cost per unit (buying + packing + transport): %s.\n" +
                "- Minimum price you should charge to avoid losing money: %s.",
                markupPct, markupPct, MoneyUtils.formatInr(purchaseCost),
                grossMarginPct, MoneyUtils.formatInr(grossMarginPct),
                MoneyUtils.formatInr(totalVarCost),
                MoneyUtils.formatInr(minViablePrice)
        );

        return PricingCalculationResponse.builder()
                .purchaseCost(purchaseCost)
                .sellingPrice(sellingPrice)
                .totalVariableCost(totalVarCost)
                .effectiveSellingPriceAfterDiscount(effectiveSellingPrice)
                .grossProfit(grossProfit)
                .grossMarginPercent(grossMarginPct)
                .markupPercent(markupPct)
                .contributionMargin(contributionMargin)
                .contributionMarginRatio(contributionRatio)
                .netContribution(netContribution)
                .minimumViablePrice(minViablePrice)
                .discountImpactOnProfit(discountAmount)
                .plainLanguageExplanation(explanation)
                .build();
    }
}
