package com.marginos.breakeven;

import com.marginos.breakeven.dto.BreakEvenDto.BreakEvenCalculationRequest;
import com.marginos.breakeven.dto.BreakEvenDto.BreakEvenCalculationResponse;
import com.marginos.breakeven.service.BreakEvenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class BreakEvenServiceTest {

    private BreakEvenService breakEvenService;

    @BeforeEach
    void setUp() {
        breakEvenService = new BreakEvenService();
    }

    @Test
    @DisplayName("Should accurately calculate break-even quantity and break-even revenue")
    void testStandardBreakEven() {
        // Fixed costs = ₹50,000 | Variable cost = ₹150/unit | Price = ₹300/unit
        // Contribution per unit = ₹150
        // BEQ = 50,000 / 150 = 333.33 -> 334 units (CEILING)
        // BER = 334 * 300 = ₹1,00,200
        BreakEvenCalculationRequest req = new BreakEvenCalculationRequest();
        req.setMonthlyFixedCosts(new BigDecimal("50000.00"));
        req.setSellingPricePerUnit(new BigDecimal("300.00"));
        req.setVariableCostPerUnit(new BigDecimal("150.00"));
        req.setCurrentMonthlySalesUnits(new BigDecimal("500.00"));

        BreakEvenCalculationResponse resp = breakEvenService.calculateBreakEven(req);

        assertTrue(resp.isViable());
        assertEquals(new BigDecimal("150.00"), resp.getContributionPerUnit().setScale(2));
        assertEquals(new BigDecimal("334"), resp.getBreakevenQuantity().setScale(0));
        assertEquals(new BigDecimal("100200.00"), resp.getBreakevenRevenue().setScale(2));

        // Margin of safety = 500 - 334 = 166 units
        assertEquals(new BigDecimal("166"), resp.getMarginOfSafetyUnits().setScale(0));
        assertEquals(new BigDecimal("33.20"), resp.getMarginOfSafetyPercent().setScale(2));
    }

    @Test
    @DisplayName("Should reject and clearly flag negative or zero contribution margin")
    void testNegativeContributionBreakEven() {
        // Selling price ₹80, Variable cost ₹100 -> Negative contribution -₹20
        BreakEvenCalculationRequest req = new BreakEvenCalculationRequest();
        req.setMonthlyFixedCosts(new BigDecimal("50000.00"));
        req.setSellingPricePerUnit(new BigDecimal("80.00"));
        req.setVariableCostPerUnit(new BigDecimal("100.00"));

        BreakEvenCalculationResponse resp = breakEvenService.calculateBreakEven(req);

        assertFalse(resp.isViable());
        assertEquals(new BigDecimal("0"), resp.getBreakevenQuantity().setScale(0));
        assertTrue(resp.getMessage().contains("Negative/Zero Contribution"));
    }
}
