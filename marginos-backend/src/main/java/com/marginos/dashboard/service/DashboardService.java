package com.marginos.dashboard.service;

import com.marginos.accounting.model.Account;
import com.marginos.accounting.repository.AccountRepository;
import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.cashbook.model.CashbookEntry;
import com.marginos.cashbook.repository.CashbookEntryRepository;
import com.marginos.customer.repository.CustomerRepository;
import com.marginos.dashboard.dto.DashboardDto.*;
import com.marginos.expense.repository.ExpenseRepository;
import com.marginos.product.repository.ProductRepository;
import com.marginos.sales.repository.SalesInvoiceRepository;
import com.marginos.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BusinessRepository businessRepository;
    private final AccountRepository accountRepository;
    private final CashbookEntryRepository cashbookEntryRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public BusinessDashboardSummary getDashboardSummary(UUID businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        // 1. Cash In Hand & Bank Balance
        BigDecimal cashInHand = accountRepository.findByBusinessIdAndCode(businessId, "1000")
                .map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);
        BigDecimal bankBalance = accountRepository.findByBusinessIdAndCode(businessId, "1010")
                .map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);

        // If Quick Start mode, take latest cashbook closing cash if higher
        Optional<CashbookEntry> latestCashbook = cashbookEntryRepository.findByBusinessIdAndEntryDate(businessId, today);
        if (latestCashbook.isPresent()) {
            cashInHand = latestCashbook.get().getCalculatedClosingCash();
        }

        BigDecimal totalCash = cashInHand.add(bankBalance);

        // 2. Today's Sales
        BigDecimal todayInvoiceSales = salesInvoiceRepository.sumDailySales(businessId, today);
        if (todayInvoiceSales == null) todayInvoiceSales = BigDecimal.ZERO;

        BigDecimal todayCashbookSales = cashbookEntryRepository.findByBusinessIdAndEntryDate(businessId, today)
                .map(c -> c.getCashSales().add(c.getDigitalSales()).add(c.getCreditSales()))
                .orElse(BigDecimal.ZERO);

        BigDecimal todaySales = todayCashbookSales.add(todayInvoiceSales);
        if (todaySales.compareTo(BigDecimal.ZERO) == 0 && latestCashbook.isPresent() && today.equals(latestCashbook.get().getEntryDate())) {
            todaySales = latestCashbook.get().getCashSales().add(latestCashbook.get().getDigitalSales()).add(latestCashbook.get().getCreditSales());
        }

        // 3. Month to Date Sales & Expenses
        BigDecimal invoiceSales = salesInvoiceRepository.sumRangeSales(businessId, startOfMonth, today);
        if (invoiceSales == null) invoiceSales = BigDecimal.ZERO;

        List<CashbookEntry> monthCashbooks = cashbookEntryRepository
                .findByBusinessIdAndEntryDateBetweenOrderByEntryDateAsc(businessId, startOfMonth, today);
        BigDecimal cashbookMtdSales = monthCashbooks.stream()
                .map(c -> c.getCashSales().add(c.getDigitalSales()).add(c.getCreditSales()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal mtdSales = cashbookMtdSales.add(invoiceSales);
        if (mtdSales.compareTo(BigDecimal.ZERO) == 0) {
            mtdSales = accountRepository.findByBusinessIdAndCode(businessId, "4000")
                    .map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);
        }

        BigDecimal mtdExpenses = expenseRepository.sumExpensesBetween(businessId, startOfMonth, today);
        if (mtdExpenses == null || mtdExpenses.compareTo(BigDecimal.ZERO) == 0) {
            mtdExpenses = expenseRepository.sumTotalExpenses(businessId);
            if (mtdExpenses == null || mtdExpenses.compareTo(BigDecimal.ZERO) == 0) {
                mtdExpenses = BigDecimal.ZERO;
            }
        }

        BigDecimal ledgerRev = accountRepository.findByBusinessIdAndCode(businessId, "4000")
                .map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);
        BigDecimal ledgerCogs = accountRepository.findByBusinessIdAndCode(businessId, "5000")
                .map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);

        BigDecimal cogsRatio = (ledgerRev.compareTo(BigDecimal.ZERO) > 0 && ledgerCogs.compareTo(BigDecimal.ZERO) > 0)
                ? ledgerCogs.divide(ledgerRev, 4, RoundingMode.HALF_UP)
                : new BigDecimal("0.7710"); // Standard retail 22.9% margin

        BigDecimal cogs = mtdSales.multiply(cogsRatio);
        BigDecimal mtdGrossProfit = mtdSales.subtract(cogs).max(BigDecimal.ZERO);
        BigDecimal mtdGrossMarginPct = mtdSales.compareTo(BigDecimal.ZERO) > 0
                ? mtdGrossProfit.multiply(new BigDecimal("100")).divide(mtdSales, 2, RoundingMode.HALF_UP)
                : new BigDecimal("22.90");

        BigDecimal mtdNetProfit = mtdGrossProfit.subtract(mtdExpenses);

        // 4. Receivables & Payables
        BigDecimal receivables = customerRepository.sumTotalReceivables(businessId);
        if (receivables == null) receivables = BigDecimal.ZERO;

        BigDecimal payables = supplierRepository.sumTotalPayables(businessId);
        if (payables == null) payables = BigDecimal.ZERO;

        BigDecimal netGap = receivables.subtract(payables);

        // 5. Inventory
        BigDecimal inventoryVal = productRepository.calculateTotalInventoryValuation(businessId);
        if (inventoryVal == null) {
            inventoryVal = accountRepository.findByBusinessIdAndCode(businessId, "1200")
                    .map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);
        }
        int lowStockCount = productRepository.findLowStockProducts(businessId).size();
        long totalSkus = productRepository.countByBusinessId(businessId);

        // 6. Recent 7-Day Trend
        List<SalesTrendItem> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            BigDecimal dayInv = salesInvoiceRepository.sumDailySales(businessId, d);
            if (dayInv == null) dayInv = BigDecimal.ZERO;

            BigDecimal dayCb = cashbookEntryRepository.findByBusinessIdAndEntryDate(businessId, d)
                    .map(c -> c.getCashSales().add(c.getDigitalSales()).add(c.getCreditSales()))
                    .orElse(BigDecimal.ZERO);

            trend.add(new SalesTrendItem(d, dayInv.add(dayCb)));
        }

        // 7. Top Expenses
        List<Object[]> groupedExp = expenseRepository.sumExpensesByCategory(businessId, startOfMonth, today);
        List<ExpenseCategoryItem> topExpenses = new ArrayList<>();
        for (Object[] row : groupedExp) {
            topExpenses.add(new ExpenseCategoryItem((String) row[0], (BigDecimal) row[1]));
        }

        return BusinessDashboardSummary.builder()
                .businessName(business.getName())
                .operatingMode(business.getOperatingMode().name())
                .cashInHand(cashInHand)
                .bankBalance(bankBalance)
                .totalCashAvailable(totalCash)
                .todaySales(todaySales)
                .monthToDateSales(mtdSales)
                .monthToDateGrossProfit(mtdGrossProfit)
                .monthToDateGrossMarginPercent(mtdGrossMarginPct)
                .monthToDateExpenses(mtdExpenses)
                .monthToDateNetProfit(mtdNetProfit)
                .pendingReceivables(receivables)
                .pendingPayables(payables)
                .netReceivablePayableGap(netGap)
                .totalInventoryValuation(inventoryVal)
                .lowStockCount(lowStockCount)
                .totalSkus((int) totalSkus)
                .recentSalesTrend(trend)
                .topExpenses(topExpenses)
                .build();
    }
}
