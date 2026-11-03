package com.marginos.loan.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class LoanDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalculateLoanRequest {
        private String lenderName = "Bank / NBFC";

        @NotNull(message = "Principal amount is required")
        private BigDecimal principalAmount;

        @NotNull(message = "Annual interest rate is required")
        private BigDecimal annualInterestRatePercent; // e.g. 11.5%

        @NotNull(message = "Tenure in months is required")
        private Integer tenureMonths; // e.g. 24, 36, 60

        private BigDecimal processingFeePercent = new BigDecimal("1.00");
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoanCalculationResponse {
        private String lenderName;
        private BigDecimal principalAmount;
        private BigDecimal annualInterestRatePercent;
        private int tenureMonths;
        private BigDecimal monthlyEmi;
        private BigDecimal totalInterest;
        private BigDecimal totalPayment;
        private BigDecimal processingFeeAmount;
        private BigDecimal netDisbursalAmount;
        private BigDecimal monthlyOperatingProfit;
        private BigDecimal debtServiceCoverageRatio; // Operating Profit / EMI
        private String affordabilityStatus;         // COMFORTABLE, BORDERLINE, HIGH_RISK
        private String plainLanguageRecommendation;
        private List<AmortizationScheduleItem> schedule;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AmortizationScheduleItem {
        private int monthNumber;
        private BigDecimal beginningBalance;
        private BigDecimal emi;
        private BigDecimal principalPaid;
        private BigDecimal interestPaid;
        private BigDecimal endingBalance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SavedLoanResponse {
        private UUID id;
        private String lenderName;
        private BigDecimal principalAmount;
        private BigDecimal annualInterestRate;
        private int tenureMonths;
        private BigDecimal monthlyEmi;
        private BigDecimal totalInterest;
        private BigDecimal totalPayment;
        private boolean affordable;
    }
}
