package com.marginos.budget.service;

import com.marginos.accounting.dto.AccountingDto.ProfitLossReport;
import com.marginos.accounting.service.AccountingService;
import com.marginos.budget.dto.BudgetDto.*;
import com.marginos.budget.model.Budget;
import com.marginos.budget.repository.BudgetRepository;
import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.common.MoneyUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final BusinessRepository businessRepository;
    private final AccountingService accountingService;

    @Transactional
    public Budget saveBudget(UUID businessId, SaveBudgetRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));

        Budget budget = budgetRepository.findByBusinessIdAndYearAndMonthNumber(businessId, req.getYear(), req.getMonthNumber())
                .orElseGet(() -> Budget.builder()
                        .business(business)
                        .year(req.getYear())
                        .monthNumber(req.getMonthNumber())
                        .build());

        String name = req.getName();
        if (name == null || name.isBlank()) {
            name = Month.of(req.getMonthNumber()).name() + " " + req.getYear() + " Budget";
        }

        budget.setName(name);
        budget.setBudgetedRevenue(req.getBudgetedRevenue() != null ? req.getBudgetedRevenue() : BigDecimal.ZERO);
        budget.setBudgetedCogs(req.getBudgetedCogs() != null ? req.getBudgetedCogs() : BigDecimal.ZERO);
        budget.setBudgetedExpenses(req.getBudgetedExpenses() != null ? req.getBudgetedExpenses() : BigDecimal.ZERO);
        budget.setNotes(req.getNotes());

        return budgetRepository.save(budget);
    }

    @Transactional(readOnly = true)
    public BudgetVarianceResponse getMonthlyVariance(UUID businessId, int year, int month) {
        Optional<Budget> budgetOpt = budgetRepository.findByBusinessIdAndYearAndMonthNumber(businessId, year, month);

        BigDecimal budgetedRev = budgetOpt.map(Budget::getBudgetedRevenue).orElse(new BigDecimal("350000.00"));
        BigDecimal budgetedExp = budgetOpt.map(Budget::getBudgetedExpenses).orElse(new BigDecimal("45000.00"));
        BigDecimal budgetedProfit = budgetedRev.subtract(budgetedExp);

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        BigDecimal actualRev = BigDecimal.ZERO;
        BigDecimal actualExp = BigDecimal.ZERO;
        BigDecimal actualProfit = BigDecimal.ZERO;

        try {
            ProfitLossReport pnl = accountingService.getProfitLoss(businessId, start, end);
            actualRev = pnl.getSalesRevenue() != null ? pnl.getSalesRevenue() : BigDecimal.ZERO;
            actualExp = pnl.getTotalOperatingExpenses() != null ? pnl.getTotalOperatingExpenses() : BigDecimal.ZERO;
            actualProfit = pnl.getNetProfit() != null ? pnl.getNetProfit() : BigDecimal.ZERO;
        } catch (Exception e) {
            log.debug("No ledger data yet for budget month {}/{}: {}", month, year, e.getMessage());
        }

        BigDecimal revVariance = actualRev.subtract(budgetedRev);
        BigDecimal revVarPct = budgetedRev.compareTo(BigDecimal.ZERO) > 0
                ? revVariance.multiply(new BigDecimal("100")).divide(budgetedRev, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal expVariance = actualExp.subtract(budgetedExp);
        BigDecimal expVarPct = budgetedExp.compareTo(BigDecimal.ZERO) > 0
                ? expVariance.multiply(new BigDecimal("100")).divide(budgetedExp, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal profitVariance = actualProfit.subtract(budgetedProfit);

        String summary = String.format(
                "Revenue: %s vs Budget %s (%s%%) | Operating Expenses: %s vs Budget %s (%s%%) | Net Profit Variance: %s",
                MoneyUtils.formatInr(actualRev), MoneyUtils.formatInr(budgetedRev), revVarPct,
                MoneyUtils.formatInr(actualExp), MoneyUtils.formatInr(budgetedExp), expVarPct,
                MoneyUtils.formatInr(profitVariance)
        );

        return BudgetVarianceResponse.builder()
                .year(year)
                .monthNumber(month)
                .monthName(Month.of(month).name())
                .budgetedRevenue(budgetedRev)
                .actualRevenue(actualRev)
                .revenueVariance(revVariance)
                .revenueVariancePercent(revVarPct)
                .budgetedExpenses(budgetedExp)
                .actualExpenses(actualExp)
                .expenseVariance(expVariance)
                .expenseVariancePercent(expVarPct)
                .budgetedProfit(budgetedProfit)
                .actualProfit(actualProfit)
                .profitVariance(profitVariance)
                .performanceSummary(summary)
                .build();
    }

    @Transactional(readOnly = true)
    public AnnualBudgetComparison getAnnualComparison(UUID businessId, int year) {
        List<BudgetVarianceResponse> list = new ArrayList<>();
        BigDecimal totBRev = BigDecimal.ZERO;
        BigDecimal totARev = BigDecimal.ZERO;
        BigDecimal totBExp = BigDecimal.ZERO;
        BigDecimal totAExp = BigDecimal.ZERO;

        for (int m = 1; m <= 12; m++) {
            BudgetVarianceResponse v = getMonthlyVariance(businessId, year, m);
            list.add(v);
            totBRev = totBRev.add(v.getBudgetedRevenue());
            totARev = totARev.add(v.getActualRevenue());
            totBExp = totBExp.add(v.getBudgetedExpenses());
            totAExp = totAExp.add(v.getActualExpenses());
        }

        return AnnualBudgetComparison.builder()
                .year(year)
                .monthlyVariances(list)
                .annualBudgetedRevenue(totBRev)
                .annualActualRevenue(totARev)
                .annualBudgetedExpenses(totBExp)
                .annualActualExpenses(totAExp)
                .build();
    }
}
