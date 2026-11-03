package com.marginos.cashbook.service;

import com.marginos.accounting.model.Account;
import com.marginos.accounting.repository.AccountRepository;
import com.marginos.auth.model.User;
import com.marginos.auth.repository.UserRepository;
import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.cashbook.dto.CashbookDto.*;
import com.marginos.cashbook.model.CashbookEntry;
import com.marginos.cashbook.repository.CashbookEntryRepository;
import com.marginos.common.MoneyUtils;
import com.marginos.customer.repository.CustomerRepository;
import com.marginos.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CashbookService {

    private final CashbookEntryRepository cashbookEntryRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;

    @Transactional
    public CashbookEntryResponse saveDailyEntry(UUID businessId, UUID userId, SaveDailyCashbookRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        CashbookEntry entry = cashbookEntryRepository.findByBusinessIdAndEntryDate(businessId, req.getEntryDate())
                .orElseGet(() -> CashbookEntry.builder()
                        .business(business)
                        .entryDate(req.getEntryDate())
                        .createdBy(user)
                        .build());

        // Opening cash: if not explicitly supplied, find previous day closing cash
        BigDecimal opening = req.getOpeningCash();
        if (opening == null && entry.getOpeningCash().compareTo(BigDecimal.ZERO) == 0) {
            Optional<CashbookEntry> prevEntry = cashbookEntryRepository
                    .findByBusinessIdAndEntryDate(businessId, req.getEntryDate().minusDays(1));
            opening = prevEntry.map(CashbookEntry::getCalculatedClosingCash).orElse(BigDecimal.ZERO);
        }
        if (opening != null) entry.setOpeningCash(opening);

        if (req.getCashSales() != null) entry.setCashSales(req.getCashSales());
        if (req.getDigitalSales() != null) entry.setDigitalSales(req.getDigitalSales());
        if (req.getCreditSales() != null) entry.setCreditSales(req.getCreditSales());
        if (req.getCashPurchases() != null) entry.setCashPurchases(req.getCashPurchases());
        if (req.getOperatingExpenses() != null) entry.setOperatingExpenses(req.getOperatingExpenses());
        if (req.getCustomerCollections() != null) entry.setCustomerCollections(req.getCustomerCollections());
        if (req.getSupplierPayments() != null) entry.setSupplierPayments(req.getSupplierPayments());
        if (req.getCashDeposits() != null) entry.setCashDeposits(req.getCashDeposits());
        if (req.getCashWithdrawals() != null) entry.setCashWithdrawals(req.getCashWithdrawals());
        if (req.getOwnerCapital() != null) entry.setOwnerCapital(req.getOwnerCapital());
        if (req.getOwnerDrawings() != null) entry.setOwnerDrawings(req.getOwnerDrawings());
        if (req.getLoanReceived() != null) entry.setLoanReceived(req.getLoanReceived());
        if (req.getLoanRepaid() != null) entry.setLoanRepaid(req.getLoanRepaid());
        if (req.getCountedCash() != null) entry.setCountedCash(req.getCountedCash());
        if (req.getEstimatedCostOfGoods() != null) entry.setEstimatedCostOfGoods(req.getEstimatedCostOfGoods());
        if (req.getNotes() != null) entry.setNotes(req.getNotes());
        entry.setClosed(req.isClosed());

        // Recalculate cash totals & estimated profits
        entry.calculateTotals();

        CashbookEntry saved = cashbookEntryRepository.save(entry);

        // Synchronize Cash in Hand account balance (account 1000)
        Optional<Account> cashAccountOpt = accountRepository.findByBusinessIdAndCode(businessId, "1000");
        cashAccountOpt.ifPresent(acc -> {
            acc.setCurrentBalance(saved.getCalculatedClosingCash());
            accountRepository.save(acc);
        });

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public CashbookEntryResponse getEntryByDate(UUID businessId, LocalDate date) {
        if (date == null) date = LocalDate.now();
        Optional<CashbookEntry> entryOpt = cashbookEntryRepository.findByBusinessIdAndEntryDate(businessId, date);

        if (entryOpt.isPresent()) {
            return toResponse(entryOpt.get());
        }

        // Return empty template with previous day's closing cash as opening cash
        Optional<CashbookEntry> prevEntry = cashbookEntryRepository
                .findByBusinessIdAndEntryDate(businessId, date.minusDays(1));
        BigDecimal prevClosing = prevEntry.map(CashbookEntry::getCalculatedClosingCash)
                .orElse(accountRepository.findByBusinessIdAndCode(businessId, "1000")
                        .map(Account::getCurrentBalance).orElse(BigDecimal.ZERO));

        CashbookEntry blank = CashbookEntry.builder()
                .entryDate(date)
                .openingCash(prevClosing)
                .calculatedClosingCash(prevClosing)
                .build();
        blank.calculateTotals();
        return toResponse(blank);
    }

    @Transactional(readOnly = true)
    public Page<CashbookEntryResponse> getHistory(UUID businessId, Pageable pageable) {
        return cashbookEntryRepository.findByBusinessIdOrderByEntryDateDesc(businessId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CashSummaryResponse getSummary(UUID businessId) {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(6);

        CashbookEntryResponse todayEntry = getEntryByDate(businessId, today);
        List<CashbookEntry> last7Days = cashbookEntryRepository
                .findByBusinessIdAndEntryDateBetweenOrderByEntryDateAsc(businessId, weekAgo, today);

        BigDecimal weeklySales = BigDecimal.ZERO;
        BigDecimal weeklyExpenses = BigDecimal.ZERO;
        List<DailyTrendItem> trend = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            Optional<CashbookEntry> dayEntry = last7Days.stream()
                    .filter(e -> e.getEntryDate().equals(d))
                    .findFirst();

            BigDecimal sales = dayEntry.map(e -> e.getCashSales().add(e.getDigitalSales()).add(e.getCreditSales()))
                    .orElse(BigDecimal.ZERO);
            BigDecimal exp = dayEntry.map(CashbookEntry::getOperatingExpenses).orElse(BigDecimal.ZERO);
            BigDecimal closing = dayEntry.map(CashbookEntry::getCalculatedClosingCash)
                    .orElse(todayEntry.getCalculatedClosingCash());

            weeklySales = weeklySales.add(sales);
            weeklyExpenses = weeklyExpenses.add(exp);

            trend.add(DailyTrendItem.builder()
                    .date(d)
                    .sales(sales)
                    .expenses(exp)
                    .closingCash(closing)
                    .build());
        }

        BigDecimal pendingReceivables = customerRepository.sumTotalReceivables(businessId);
        BigDecimal pendingPayables = supplierRepository.sumTotalPayables(businessId);

        // Format WhatsApp daily message
        String whatsappMsg = String.format(
                "📊 *MarginOS Daily Summary* - %s\n\n" +
                "💵 Cash in Hand: %s\n" +
                "🛍️ Today's Sales: %s (Cash: %s, UPI: %s)\n" +
                "📉 Expenses: %s\n" +
                "📈 Est. Net Profit: %s\n" +
                "⏳ Pending Customer Khata: %s\n" +
                "🏢 Owed to Suppliers: %s\n\n" +
                "_Powered by MarginOS_",
                today,
                MoneyUtils.formatInr(todayEntry.getCalculatedClosingCash()),
                MoneyUtils.formatInr(todayEntry.getTotalSales()),
                MoneyUtils.formatInr(todayEntry.getCashSales()),
                MoneyUtils.formatInr(todayEntry.getDigitalSales()),
                MoneyUtils.formatInr(todayEntry.getOperatingExpenses()),
                MoneyUtils.formatInr(todayEntry.getEstimatedNetProfit()),
                MoneyUtils.formatInr(pendingReceivables != null ? pendingReceivables : BigDecimal.ZERO),
                MoneyUtils.formatInr(pendingPayables != null ? pendingPayables : BigDecimal.ZERO)
        );

        return CashSummaryResponse.builder()
                .cashInHand(todayEntry.getCalculatedClosingCash())
                .todaySales(todayEntry.getTotalSales())
                .todayExpenses(todayEntry.getOperatingExpenses())
                .pendingCollections(pendingReceivables != null ? pendingReceivables : BigDecimal.ZERO)
                .pendingSupplierPayments(pendingPayables != null ? pendingPayables : BigDecimal.ZERO)
                .weeklySalesTotal(weeklySales)
                .weeklyExpenseTotal(weeklyExpenses)
                .last7DaysTrend(trend)
                .whatsappSummaryText(whatsappMsg)
                .build();
    }

    private CashbookEntryResponse toResponse(CashbookEntry e) {
        BigDecimal totalSales = e.getCashSales()
                .add(e.getDigitalSales() != null ? e.getDigitalSales() : BigDecimal.ZERO)
                .add(e.getCreditSales() != null ? e.getCreditSales() : BigDecimal.ZERO);

        BigDecimal grossProfit = e.getEstimatedGrossProfit() != null ? e.getEstimatedGrossProfit() : BigDecimal.ZERO;
        BigDecimal grossMarginPct = totalSales.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.multiply(new BigDecimal("100")).divide(totalSales, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return CashbookEntryResponse.builder()
                .id(e.getId())
                .entryDate(e.getEntryDate())
                .openingCash(e.getOpeningCash())
                .cashSales(e.getCashSales())
                .digitalSales(e.getDigitalSales())
                .creditSales(e.getCreditSales())
                .totalSales(totalSales)
                .cashPurchases(e.getCashPurchases())
                .operatingExpenses(e.getOperatingExpenses())
                .customerCollections(e.getCustomerCollections())
                .supplierPayments(e.getSupplierPayments())
                .cashDeposits(e.getCashDeposits())
                .cashWithdrawals(e.getCashWithdrawals())
                .ownerCapital(e.getOwnerCapital())
                .ownerDrawings(e.getOwnerDrawings())
                .loanReceived(e.getLoanReceived())
                .loanRepaid(e.getLoanRepaid())
                .calculatedClosingCash(e.getCalculatedClosingCash())
                .countedCash(e.getCountedCash())
                .cashVariance(e.getCashVariance())
                .estimatedCostOfGoods(e.getEstimatedCostOfGoods())
                .estimatedGrossProfit(grossProfit)
                .estimatedGrossMarginPercent(grossMarginPct)
                .estimatedNetProfit(e.getEstimatedNetProfit())
                .notes(e.getNotes())
                .isClosed(e.isClosed())
                .build();
    }
}
