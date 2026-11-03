package com.marginos.breakeven.service;

import com.marginos.breakeven.dto.BreakEvenDto.*;
import com.marginos.common.MoneyUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class BreakEvenService {

    public BreakEvenCalculationResponse calculateBreakEven(BreakEvenCalculationRequest req) {
        BigDecimal fixedCosts = req.getMonthlyFixedCosts() != null ? req.getMonthlyFixedCosts() : BigDecimal.ZERO;
        BigDecimal price = req.getSellingPricePerUnit() != null ? req.getSellingPricePerUnit() : BigDecimal.ZERO;
        BigDecimal varCost = req.getVariableCostPerUnit() != null ? req.getVariableCostPerUnit() : BigDecimal.ZERO;
        BigDecimal currentUnits = req.getCurrentMonthlySalesUnits() != null ? req.getCurrentMonthlySalesUnits() : BigDecimal.ZERO;

        BigDecimal contribution = price.subtract(varCost);

        // Invariant check: If contribution <= 0, positive break-even cannot be calculated
        if (contribution.compareTo(BigDecimal.ZERO) <= 0) {
            String msg = String.format(
                    "⚠️ Negative/Zero Contribution (%s): Selling price (%s) is less than or equal to variable cost (%s). " +
                    "Selling more units will only deepen losses. You must either increase price or reduce procurement costs.",
                    MoneyUtils.formatInr(contribution), MoneyUtils.formatInr(price), MoneyUtils.formatInr(varCost));

            return BreakEvenCalculationResponse.builder()
                    .fixedCosts(fixedCosts)
                    .sellingPricePerUnit(price)
                    .variableCostPerUnit(varCost)
                    .contributionPerUnit(contribution)
                    .contributionMarginRatio(BigDecimal.ZERO)
                    .breakevenQuantity(BigDecimal.ZERO)
                    .breakevenRevenue(BigDecimal.ZERO)
                    .dailyBreakevenRevenue(BigDecimal.ZERO)
                    .marginOfSafetyUnits(BigDecimal.ZERO)
                    .marginOfSafetyPercent(BigDecimal.ZERO)
                    .isViable(false)
                    .message(msg)
                    .sensitivityMatrix(List.of())
                    .build();
        }

        BigDecimal cmRatio = price.compareTo(BigDecimal.ZERO) > 0
                ? contribution.multiply(new BigDecimal("100")).divide(price, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Break-even Quantity = Fixed Costs / Contribution per unit
        BigDecimal beq = fixedCosts.divide(contribution, 0, RoundingMode.CEILING);
        // Break-even Revenue = Break-even Quantity * Price
        BigDecimal ber = beq.multiply(price).setScale(2, RoundingMode.HALF_UP);
        BigDecimal dailyTarget = ber.divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP);

        BigDecimal mosUnits = BigDecimal.ZERO;
        BigDecimal mosPercent = BigDecimal.ZERO;
        if (currentUnits.compareTo(BigDecimal.ZERO) > 0) {
            mosUnits = currentUnits.subtract(beq);
            mosPercent = mosUnits.multiply(new BigDecimal("100")).divide(currentUnits, 2, RoundingMode.HALF_UP);
        }

        String msg = String.format(
                "✅ Break-even Target: You need to sell at least %s units (%s/month or ~%s/day) just to pay for rent, salaries, and operating expenses. " +
                "Every unit sold after %s units generates %s in pure profit.",
                beq.toPlainString(), MoneyUtils.formatInr(ber), MoneyUtils.formatInr(dailyTarget),
                beq.toPlainString(), MoneyUtils.formatInr(contribution));

        // Sensitivity matrix: what happens if price changes by -5%, +5%, +10%?
        List<SensitivityItem> sensitivity = new ArrayList<>();
        sensitivity.add(createSensitivity("Base Scenario", price, fixedCosts, varCost));
        sensitivity.add(createSensitivity("Price +5%", price.multiply(new BigDecimal("1.05")), fixedCosts, varCost));
        sensitivity.add(createSensitivity("Price +10%", price.multiply(new BigDecimal("1.10")), fixedCosts, varCost));
        sensitivity.add(createSensitivity("Price -5% Discount", price.multiply(new BigDecimal("0.95")), fixedCosts, varCost));

        return BreakEvenCalculationResponse.builder()
                .fixedCosts(fixedCosts)
                .sellingPricePerUnit(price)
                .variableCostPerUnit(varCost)
                .contributionPerUnit(contribution)
                .contributionMarginRatio(cmRatio)
                .breakevenQuantity(beq)
                .breakevenRevenue(ber)
                .dailyBreakevenRevenue(dailyTarget)
                .marginOfSafetyUnits(mosUnits)
                .marginOfSafetyPercent(mosPercent)
                .isViable(true)
                .message(msg)
                .sensitivityMatrix(sensitivity)
                .build();
    }

    private SensitivityItem createSensitivity(String name, BigDecimal testPrice, BigDecimal fixed, BigDecimal varCost) {
        BigDecimal testContrib = testPrice.subtract(varCost);
        if (testContrib.compareTo(BigDecimal.ZERO) <= 0) {
            return SensitivityItem.builder()
                    .scenarioName(name)
                    .price(testPrice)
                    .breakevenUnits(BigDecimal.ZERO)
                    .breakevenRevenue(BigDecimal.ZERO)
                    .impact("Not viable (negative margin)")
                    .build();
        }

        BigDecimal testBeq = fixed.divide(testContrib, 0, RoundingMode.CEILING);
        BigDecimal testBer = testBeq.multiply(testPrice).setScale(2, RoundingMode.HALF_UP);

        return SensitivityItem.builder()
                .scenarioName(name)
                .price(testPrice)
                .breakevenUnits(testBeq)
                .breakevenRevenue(testBer)
                .impact(String.format("Requires %s units (%s)", testBeq, MoneyUtils.formatInr(testBer)))
                .build();
    }
}
