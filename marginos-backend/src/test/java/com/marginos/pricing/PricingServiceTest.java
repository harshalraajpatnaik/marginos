package com.marginos.pricing;

import com.marginos.pricing.dto.PricingDto.PricingCalculationRequest;
import com.marginos.pricing.dto.PricingDto.PricingCalculationResponse;
import com.marginos.pricing.service.PricingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class PricingServiceTest {

    private PricingService pricingService;

    @BeforeEach
    void setUp() {
        pricingService = new PricingService();
    }

    @Test
    @DisplayName("Should correctly calculate Gross Profit, Margin, and Markup and ensure Margin != Markup")
    void testMarkupVsMarginCalculation() {
        // Buy at ₹100, Sell at ₹150
        // Gross Profit = ₹50
        // Markup = 50 / 100 * 100 = 50.00%
        // Margin = 50 / 150 * 100 = 33.33%
        PricingCalculationRequest req = new PricingCalculationRequest();
        req.setPurchaseCost(new BigDecimal("100.00"));
        req.setSellingPrice(new BigDecimal("150.00"));

        PricingCalculationResponse resp = pricingService.calculatePricing(req);

        assertEquals(new BigDecimal("50.00"), resp.getGrossProfit().setScale(2));
        assertEquals(new BigDecimal("50.00"), resp.getMarkupPercent().setScale(2));
        assertEquals(new BigDecimal("33.33"), resp.getGrossMarginPercent().setScale(2));
        assertNotEquals(resp.getMarkupPercent(), resp.getGrossMarginPercent(), "Markup and margin must never be confused!");
    }

    @Test
    @DisplayName("Should include packaging and transport into Total Variable Cost")
    void testVariableCostsIncluded() {
        PricingCalculationRequest req = new PricingCalculationRequest();
        req.setPurchaseCost(new BigDecimal("200.00"));
        req.setPackagingCost(new BigDecimal("15.00"));
        req.setTransportCost(new BigDecimal("25.00"));
        req.setSellingPrice(new BigDecimal("300.00"));

        PricingCalculationResponse resp = pricingService.calculatePricing(req);

        // Total variable cost = 200 + 15 + 25 = 240
        assertEquals(new BigDecimal("240.00"), resp.getTotalVariableCost().setScale(2));
        // Contribution = 300 - 240 = 60
        assertEquals(new BigDecimal("60.00"), resp.getContributionMargin().setScale(2));
    }

    @Test
    @DisplayName("Should calculate impact of counter discount on margins")
    void testDiscountImpact() {
        PricingCalculationRequest req = new PricingCalculationRequest();
        req.setPurchaseCost(new BigDecimal("100.00"));
        req.setSellingPrice(new BigDecimal("200.00"));
        req.setDiscountPercent(new BigDecimal("10.00")); // 10% discount -> Effective selling price ₹180

        PricingCalculationResponse resp = pricingService.calculatePricing(req);

        assertEquals(new BigDecimal("180.00"), resp.getEffectiveSellingPriceAfterDiscount().setScale(2));
        assertEquals(new BigDecimal("80.00"), resp.getGrossProfit().setScale(2));
        // Margin = 80 / 180 * 100 = 44.44%
        assertEquals(new BigDecimal("44.44"), resp.getGrossMarginPercent().setScale(2));
    }
}
