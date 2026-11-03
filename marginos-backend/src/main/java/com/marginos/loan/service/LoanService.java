package com.marginos.loan.service;

import com.marginos.accounting.dto.AccountingDto.ProfitLossReport;
import com.marginos.accounting.service.AccountingService;
import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.common.MoneyUtils;
import com.marginos.loan.dto.LoanDto.*;
import com.marginos.loan.model.LoanModel;
import com.marginos.loan.repository.LoanModelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanModelRepository loanModelRepository;
    private final BusinessRepository businessRepository;
    private final AccountingService accountingService;

    public LoanCalculationResponse calculateLoan(UUID businessId, CalculateLoanRequest req) {
        BigDecimal p = req.getPrincipalAmount();
        BigDecimal annualRate = req.getAnnualInterestRatePercent();
        int n = req.getTenureMonths() > 0 ? req.getTenureMonths() : 12;

        // Monthly interest rate r = (annualRate / 12) / 100
        double r = annualRate.doubleValue() / 12.0 / 100.0;
        double pVal = p.doubleValue();

        // Standard EMI Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
        double emiVal;
        if (r > 0) {
            double factor = Math.pow(1.0 + r, n);
            emiVal = (pVal * r * factor) / (factor - 1.0);
        } else {
            emiVal = pVal / n;
        }

        BigDecimal emi = BigDecimal.valueOf(emiVal).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPayment = emi.multiply(BigDecimal.valueOf(n)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalInterest = totalPayment.subtract(p).max(BigDecimal.ZERO);

        BigDecimal feePct = req.getProcessingFeePercent() != null ? req.getProcessingFeePercent() : BigDecimal.ZERO;
        BigDecimal feeAmount = p.multiply(feePct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal netDisbursal = p.subtract(feeAmount);

        // Amortization Schedule
        List<AmortizationScheduleItem> schedule = new ArrayList<>();
        double balance = pVal;

        for (int m = 1; m <= n; m++) {
            double interestMonth = balance * r;
            double principalMonth = emiVal - interestMonth;
            double endingBal = balance - principalMonth;
            if (m == n || endingBal < 0) endingBal = 0;

            schedule.add(AmortizationScheduleItem.builder()
                    .monthNumber(m)
                    .beginningBalance(BigDecimal.valueOf(balance).setScale(2, RoundingMode.HALF_UP))
                    .emi(emi)
                    .principalPaid(BigDecimal.valueOf(principalMonth).setScale(2, RoundingMode.HALF_UP))
                    .interestPaid(BigDecimal.valueOf(interestMonth).setScale(2, RoundingMode.HALF_UP))
                    .endingBalance(BigDecimal.valueOf(endingBal).setScale(2, RoundingMode.HALF_UP))
                    .build());

            balance = endingBal;
        }

        // Compare against business operating profit
        BigDecimal monthlyOperatingProfit = new BigDecimal("45000.00"); // default baseline
        try {
            ProfitLossReport pnl = accountingService.getProfitLoss(businessId, LocalDate.now().minusDays(30), LocalDate.now());
            if (pnl.getOperatingProfit() != null && pnl.getOperatingProfit().compareTo(BigDecimal.ZERO) > 0) {
                monthlyOperatingProfit = pnl.getOperatingProfit();
            }
        } catch (Exception e) {
            log.debug("Could not fetch current P&L for DSCR comparison: {}", e.getMessage());
        }

        BigDecimal dscr = emi.compareTo(BigDecimal.ZERO) > 0
                ? monthlyOperatingProfit.divide(emi, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String status;
        String recommendation;
        if (dscr.compareTo(new BigDecimal("2.0")) >= 0) {
            status = "COMFORTABLE";
            recommendation = String.format(
                    "✅ Loan appears highly affordable: Your estimated monthly operating profit (%s) is %sx your monthly EMI (%s).",
                    MoneyUtils.formatInr(monthlyOperatingProfit), dscr, MoneyUtils.formatInr(emi));
        } else if (dscr.compareTo(new BigDecimal("1.2")) >= 0) {
            status = "BORDERLINE";
            recommendation = String.format(
                    "⚠️ Manageable but tight: EMI (%s) will take %s%% of your monthly operating profit (%s). A small drop in sales could cause payment strain.",
                    MoneyUtils.formatInr(emi),
                    emi.multiply(new BigDecimal("100")).divide(monthlyOperatingProfit, 1, RoundingMode.HALF_UP),
                    MoneyUtils.formatInr(monthlyOperatingProfit));
        } else {
            status = "HIGH_RISK";
            recommendation = String.format(
                    "🚨 High Risk: EMI (%s) exceeds or nearly equals your monthly operating profit (%s). Do not take this loan unless it directly generates new revenue.",
                    MoneyUtils.formatInr(emi), MoneyUtils.formatInr(monthlyOperatingProfit));
        }

        return LoanCalculationResponse.builder()
                .lenderName(req.getLenderName())
                .principalAmount(p)
                .annualInterestRatePercent(annualRate)
                .tenureMonths(n)
                .monthlyEmi(emi)
                .totalInterest(totalInterest)
                .totalPayment(totalPayment)
                .processingFeeAmount(feeAmount)
                .netDisbursalAmount(netDisbursal)
                .monthlyOperatingProfit(monthlyOperatingProfit)
                .debtServiceCoverageRatio(dscr)
                .affordabilityStatus(status)
                .plainLanguageRecommendation(recommendation + "\n\n_Note: This is an analytical estimation model, not a loan approval or financial advice._")
                .schedule(schedule)
                .build();
    }

    @Transactional
    public SavedLoanResponse saveLoanModel(UUID businessId, CalculateLoanRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));

        LoanCalculationResponse calc = calculateLoan(businessId, req);

        LoanModel model = LoanModel.builder()
                .business(business)
                .lenderName(req.getLenderName())
                .principalAmount(calc.getPrincipalAmount())
                .annualInterestRate(calc.getAnnualInterestRatePercent())
                .tenureMonths(calc.getTenureMonths())
                .monthlyEmi(calc.getMonthlyEmi())
                .totalInterest(calc.getTotalInterest())
                .totalPayment(calc.getTotalPayment())
                .debtServiceRatio(calc.getDebtServiceCoverageRatio())
                .affordable(!"HIGH_RISK".equals(calc.getAffordabilityStatus()))
                .notes(calc.getPlainLanguageRecommendation())
                .build();

        LoanModel saved = loanModelRepository.save(model);
        return SavedLoanResponse.builder()
                .id(saved.getId())
                .lenderName(saved.getLenderName())
                .principalAmount(saved.getPrincipalAmount())
                .annualInterestRate(saved.getAnnualInterestRate())
                .tenureMonths(saved.getTenureMonths())
                .monthlyEmi(saved.getMonthlyEmi())
                .totalInterest(saved.getTotalInterest())
                .totalPayment(saved.getTotalPayment())
                .affordable(saved.isAffordable())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SavedLoanResponse> getSavedLoanModels(UUID businessId) {
        return loanModelRepository.findByBusinessIdOrderByCreatedAtDesc(businessId).stream()
                .map(s -> SavedLoanResponse.builder()
                        .id(s.getId())
                        .lenderName(s.getLenderName())
                        .principalAmount(s.getPrincipalAmount())
                        .annualInterestRate(s.getAnnualInterestRate())
                        .tenureMonths(s.getTenureMonths())
                        .monthlyEmi(s.getMonthlyEmi())
                        .totalInterest(s.getTotalInterest())
                        .totalPayment(s.getTotalPayment())
                        .affordable(s.isAffordable())
                        .build())
                .collect(Collectors.toList());
    }
}
