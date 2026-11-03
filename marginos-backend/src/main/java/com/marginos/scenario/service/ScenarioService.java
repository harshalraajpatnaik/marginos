package com.marginos.scenario.service;

import com.marginos.accounting.dto.AccountingDto.ProfitLossReport;
import com.marginos.accounting.service.AccountingService;
import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.common.MoneyUtils;
import com.marginos.scenario.dto.ScenarioDto.*;
import com.marginos.scenario.model.Scenario;
import com.marginos.scenario.repository.ScenarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScenarioService {

    private final ScenarioRepository scenarioRepository;
    private final BusinessRepository businessRepository;
    private final AccountingService accountingService;

    @Transactional
    public ScenarioComparisonResponse simulateAndSave(UUID businessId, SimulateScenarioRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));

        // Establish baseline: use request values or pull from actual current P&L
        BigDecimal baseRevenue = req.getBaseMonthlyRevenue();
        BigDecimal baseMarginPct = req.getBaseGrossMarginPercent();
        BigDecimal baseFixedCosts = req.getBaseMonthlyFixedCosts();

        if (baseRevenue == null || baseRevenue.compareTo(BigDecimal.ZERO) <= 0) {
            try {
                ProfitLossReport pnl = accountingService.getProfitLoss(businessId, LocalDate.now().minusDays(30), LocalDate.now());
                baseRevenue = pnl.getSalesRevenue().compareTo(BigDecimal.ZERO) > 0 ? pnl.getSalesRevenue() : new BigDecimal("350000.00");
                baseMarginPct = pnl.getGrossMarginPercent().compareTo(BigDecimal.ZERO) > 0 ? pnl.getGrossMarginPercent() : new BigDecimal("20.00");
                baseFixedCosts = pnl.getTotalOperatingExpenses().compareTo(BigDecimal.ZERO) > 0 ? pnl.getTotalOperatingExpenses() : new BigDecimal("45000.00");
            } catch (Exception e) {
                baseRevenue = new BigDecimal("350000.00");
                baseMarginPct = new BigDecimal("20.00");
                baseFixedCosts = new BigDecimal("45000.00");
            }
        }

        BigDecimal baseGrossProfit = baseRevenue.multiply(baseMarginPct).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
        BigDecimal baseOperatingProfit = baseGrossProfit.subtract(baseFixedCosts);
        BigDecimal baseBreakeven = baseMarginPct.compareTo(BigDecimal.ZERO) > 0
                ? baseFixedCosts.multiply(new BigDecimal("100")).divide(baseMarginPct, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Apply adjustments
        BigDecimal salesMultiplier = BigDecimal.ONE.add(
                req.getSalesChangePercent().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        BigDecimal projectedRevenue = baseRevenue.multiply(salesMultiplier).setScale(2, RoundingMode.HALF_UP);

        // Cost changes adjust the gross margin percentage
        BigDecimal projectedMarginPct = baseMarginPct.subtract(req.getCostChangePercent()).max(BigDecimal.ZERO);
        BigDecimal projectedGrossProfit = projectedRevenue.multiply(projectedMarginPct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        // Loan EMI addition if loan modeled
        BigDecimal loanEmi = BigDecimal.ZERO;
        if (req.getNewLoanAmount() != null && req.getNewLoanAmount().compareTo(BigDecimal.ZERO) > 0 && req.getNewLoanTenureMonths() > 0) {
            double p = req.getNewLoanAmount().doubleValue();
            double r = (req.getNewLoanInterestRate() != null ? req.getNewLoanInterestRate().doubleValue() : 12.0) / 12.0 / 100.0;
            int n = req.getNewLoanTenureMonths();
            if (r > 0) {
                double factor = Math.pow(1.0 + r, n);
                loanEmi = BigDecimal.valueOf((p * r * factor) / (factor - 1.0)).setScale(2, RoundingMode.HALF_UP);
            }
        }

        // Projected Fixed Costs = Base Fixed + Rent Change + Salary Change + Loan EMI
        BigDecimal projectedFixedCosts = baseFixedCosts
                .add(req.getRentChange() != null ? req.getRentChange() : BigDecimal.ZERO)
                .add(req.getSalaryChange() != null ? req.getSalaryChange() : BigDecimal.ZERO)
                .add(loanEmi);

        BigDecimal projectedOperatingProfit = projectedGrossProfit.subtract(projectedFixedCosts);
        BigDecimal projectedBreakeven = projectedMarginPct.compareTo(BigDecimal.ZERO) > 0
                ? projectedFixedCosts.multiply(new BigDecimal("100")).divide(projectedMarginPct, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal revDelta = projectedRevenue.subtract(baseRevenue);
        BigDecimal profitDelta = projectedOperatingProfit.subtract(baseOperatingProfit);
        BigDecimal beDelta = projectedBreakeven.subtract(baseBreakeven);

        String insight;
        if (profitDelta.compareTo(BigDecimal.ZERO) > 0) {
            insight = String.format(
                    "📈 Positive Business Expansion: Under these assumptions, monthly operating profit increases by %s (from %s to %s). " +
                    "Your new monthly break-even sales target is %s (an increase of %s).",
                    MoneyUtils.formatInr(profitDelta), MoneyUtils.formatInr(baseOperatingProfit), MoneyUtils.formatInr(projectedOperatingProfit),
                    MoneyUtils.formatInr(projectedBreakeven), MoneyUtils.formatInr(beDelta));
        } else {
            insight = String.format(
                    "📉 Margin Compression Alert: Under these assumptions, monthly operating profit declines by %s (from %s to %s). " +
                    "You would need at least %s in monthly sales just to cover the higher fixed overheads.",
                    MoneyUtils.formatInr(profitDelta.abs()), MoneyUtils.formatInr(baseOperatingProfit), MoneyUtils.formatInr(projectedOperatingProfit),
                    MoneyUtils.formatInr(projectedBreakeven));
        }

        Scenario scenario = Scenario.builder()
                .business(business)
                .name(req.getName().trim())
                .description(req.getDescription())
                .baseMonthlyRevenue(baseRevenue)
                .baseGrossMarginPercent(baseMarginPct)
                .baseMonthlyFixedCosts(baseFixedCosts)
                .salesChangePercent(req.getSalesChangePercent())
                .costChangePercent(req.getCostChangePercent())
                .rentChange(req.getRentChange())
                .salaryChange(req.getSalaryChange())
                .newLoanAmount(req.getNewLoanAmount())
                .newLoanInterestRate(req.getNewLoanInterestRate())
                .newLoanTenureMonths(req.getNewLoanTenureMonths())
                .newLoanEmi(loanEmi)
                .projectedRevenue(projectedRevenue)
                .projectedGrossProfit(projectedGrossProfit)
                .projectedOperatingProfit(projectedOperatingProfit)
                .projectedBreakevenRevenue(projectedBreakeven)
                .hypothetical(true)
                .build();

        Scenario saved = scenarioRepository.save(scenario);

        return ScenarioComparisonResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .baseMonthlyRevenue(baseRevenue)
                .baseGrossProfit(baseGrossProfit)
                .baseOperatingProfit(baseOperatingProfit)
                .baseBreakevenRevenue(baseBreakeven)
                .projectedRevenue(projectedRevenue)
                .projectedGrossProfit(projectedGrossProfit)
                .projectedGrossMarginPercent(projectedMarginPct)
                .projectedOperatingProfit(projectedOperatingProfit)
                .projectedBreakevenRevenue(projectedBreakeven)
                .projectedLoanEmi(loanEmi)
                .revenueDelta(revDelta)
                .profitDelta(profitDelta)
                .breakevenDelta(beDelta)
                .isHypothetical(true)
                .businessInsight(insight + "\n\n_Note: All figures are hypothetical projections based on user-entered assumptions. These values are never mixed with official ledger records._")
                .build();
    }

    @Transactional(readOnly = true)
    public List<ScenarioComparisonResponse> getScenarios(UUID businessId) {
        return scenarioRepository.findByBusinessIdOrderByCreatedAtDesc(businessId).stream()
                .map(s -> {
                    BigDecimal baseGP = s.getBaseMonthlyRevenue().multiply(s.getBaseGrossMarginPercent())
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                    BigDecimal baseOP = baseGP.subtract(s.getBaseMonthlyFixedCosts());
                    BigDecimal baseBE = s.getBaseGrossMarginPercent().compareTo(BigDecimal.ZERO) > 0
                            ? s.getBaseMonthlyFixedCosts().multiply(new BigDecimal("100")).divide(s.getBaseGrossMarginPercent(), 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;

                    return ScenarioComparisonResponse.builder()
                            .id(s.getId())
                            .name(s.getName())
                            .description(s.getDescription())
                            .baseMonthlyRevenue(s.getBaseMonthlyRevenue())
                            .baseGrossProfit(baseGP)
                            .baseOperatingProfit(baseOP)
                            .baseBreakevenRevenue(baseBE)
                            .projectedRevenue(s.getProjectedRevenue())
                            .projectedGrossProfit(s.getProjectedGrossProfit())
                            .projectedGrossMarginPercent(s.getBaseGrossMarginPercent().subtract(s.getCostChangePercent()))
                            .projectedOperatingProfit(s.getProjectedOperatingProfit())
                            .projectedBreakevenRevenue(s.getProjectedBreakevenRevenue())
                            .projectedLoanEmi(s.getNewLoanEmi())
                            .revenueDelta(s.getProjectedRevenue().subtract(s.getBaseMonthlyRevenue()))
                            .profitDelta(s.getProjectedOperatingProfit().subtract(baseOP))
                            .breakevenDelta(s.getProjectedBreakevenRevenue().subtract(baseBE))
                            .isHypothetical(true)
                            .businessInsight("Hypothetical scenario projection.")
                            .build();
                })
                .collect(Collectors.toList());
    }
}
