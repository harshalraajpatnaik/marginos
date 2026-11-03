package com.marginos.expense.service;

import com.marginos.accounting.dto.AccountingDto.*;
import com.marginos.accounting.model.Account;
import com.marginos.accounting.model.SourceType;
import com.marginos.accounting.repository.AccountRepository;
import com.marginos.accounting.service.AccountingService;
import com.marginos.auth.model.User;
import com.marginos.auth.repository.UserRepository;
import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.expense.dto.ExpenseDto.*;
import com.marginos.expense.model.Expense;
import com.marginos.expense.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final AccountingService accountingService;
    private final AccountRepository accountRepository;

    @Transactional
    public ExpenseResponse createExpense(UUID businessId, UUID userId, CreateExpenseRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        Expense expense = Expense.builder()
                .business(business)
                .expenseDate(req.getExpenseDate())
                .category(req.getCategory().toUpperCase().trim())
                .description(req.getDescription().trim())
                .amount(req.getAmount())
                .paymentMode(req.getPaymentMode() != null ? req.getPaymentMode().toUpperCase() : "CASH")
                .vendorName(req.getVendorName())
                .recurring(req.isRecurring())
                .createdBy(user)
                .build();

        // Automatic balanced journal posting
        try {
            UUID expenseAccountId = mapCategoryToAccountId(businessId, req.getCategory());
            UUID paymentAccountId;
            if ("BANK_TRANSFER".equalsIgnoreCase(req.getPaymentMode())) {
                paymentAccountId = getAccountIdBySubCategory(businessId, "BANK", "1010");
            } else {
                paymentAccountId = getAccountIdBySubCategory(businessId, "CASH", "1000");
            }

            List<JournalLineRequest> jLines = List.of(
                    new JournalLineRequest(expenseAccountId, req.getAmount(), BigDecimal.ZERO, req.getDescription()),
                    new JournalLineRequest(paymentAccountId, BigDecimal.ZERO, req.getAmount(), req.getDescription())
            );

            CreateJournalEntryRequest jReq = new CreateJournalEntryRequest(
                    req.getExpenseDate(),
                    "EXP-" + System.currentTimeMillis() % 1000000,
                    "Expense: " + req.getCategory() + " - " + req.getDescription(),
                    SourceType.EXPENSE,
                    jLines
            );

            accountingService.postJournalEntry(businessId, userId, jReq);
        } catch (Exception e) {
            log.warn("Automatic journal posting for expense encountered: {}", e.getMessage());
        }

        Expense saved = expenseRepository.save(expense);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ExpenseResponse> getExpenses(UUID businessId, Pageable pageable) {
        return expenseRepository.findByBusinessIdOrderByExpenseDateDescCreatedAtDesc(businessId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ExpenseBreakdownReport getBreakdown(UUID businessId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        BigDecimal total = expenseRepository.sumExpensesBetween(businessId, startDate, endDate);
        if (total == null) total = BigDecimal.ZERO;

        List<Object[]> rawGrouped = expenseRepository.sumExpensesByCategory(businessId, startDate, endDate);
        List<ExpenseCategorySummary> summaries = new ArrayList<>();

        for (Object[] row : rawGrouped) {
            String cat = (String) row[0];
            BigDecimal amt = (BigDecimal) row[1];
            BigDecimal pct = total.compareTo(BigDecimal.ZERO) > 0
                    ? amt.multiply(new BigDecimal("100")).divide(total, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            summaries.add(ExpenseCategorySummary.builder()
                    .category(cat)
                    .totalAmount(amt)
                    .percentageOfTotal(pct)
                    .build());
        }

        return ExpenseBreakdownReport.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalExpenses(total)
                .categories(summaries)
                .build();
    }

    private UUID mapCategoryToAccountId(UUID businessId, String category) {
        String code = switch (category.toUpperCase()) {
            case "RENT" -> "6000";
            case "SALARIES" -> "6010";
            case "UTILITIES" -> "6020";
            case "TRANSPORT" -> "6030";
            case "INTEREST" -> "6050";
            default -> "6060";
        };
        return accountRepository.findByBusinessIdAndCode(businessId, code)
                .map(Account::getId)
                .orElseGet(() -> accountRepository.findByBusinessIdAndCode(businessId, "6060")
                        .map(Account::getId)
                        .orElseThrow(() -> new IllegalStateException("Expense account missing")));
    }

    private UUID getAccountIdBySubCategory(UUID businessId, String subCategory, String fallbackCode) {
        return accountRepository.findByBusinessIdAndSubCategory(businessId, subCategory)
                .map(Account::getId)
                .orElseGet(() -> accountRepository.findByBusinessIdAndCode(businessId, fallbackCode)
                        .map(Account::getId)
                        .orElseThrow(() -> new IllegalStateException("Required system account not found: " + fallbackCode)));
    }

    private ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .expenseDate(e.getExpenseDate())
                .category(e.getCategory())
                .description(e.getDescription())
                .amount(e.getAmount())
                .paymentMode(e.getPaymentMode())
                .vendorName(e.getVendorName())
                .recurring(e.isRecurring())
                .build();
    }
}
