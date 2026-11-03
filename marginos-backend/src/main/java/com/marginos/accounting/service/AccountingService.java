package com.marginos.accounting.service;

import com.marginos.accounting.dto.AccountingDto.*;
import com.marginos.accounting.model.*;
import com.marginos.accounting.repository.*;
import com.marginos.auth.model.User;
import com.marginos.auth.repository.UserRepository;
import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.common.MoneyUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountingService {

    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalLineRepository journalLineRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final FinancialPeriodRepository financialPeriodRepository;

    @Transactional(readOnly = true)
    public List<AccountDto> getAccounts(UUID businessId) {
        return accountRepository.findByBusinessIdOrderByCodeAsc(businessId).stream()
                .map(this::toAccountDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AccountDto createAccount(UUID businessId, CreateAccountRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));

        if (accountRepository.existsByBusinessIdAndCode(businessId, req.getCode())) {
            throw new IllegalArgumentException("Account code " + req.getCode() + " already exists in chart of accounts");
        }

        NormalBalance normalBalance = req.getNormalBalance();
        if (normalBalance == null) {
            normalBalance = (req.getAccountType() == AccountType.ASSET || req.getAccountType() == AccountType.EXPENSE)
                    ? NormalBalance.DEBIT : NormalBalance.CREDIT;
        }

        Account account = Account.builder()
                .business(business)
                .code(req.getCode().trim())
                .name(req.getName().trim())
                .accountType(req.getAccountType())
                .subCategory(req.getSubCategory().trim())
                .normalBalance(normalBalance)
                .system(false)
                .active(true)
                .currentBalance(BigDecimal.ZERO)
                .build();

        return toAccountDto(accountRepository.save(account));
    }

    @Transactional
    public JournalEntryDto postJournalEntry(UUID businessId, UUID userId, CreateJournalEntryRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        // 1. Double-Entry Invariant Validation: SUM(Debits) == SUM(Credits)
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (JournalLineRequest lineReq : req.getLines()) {
            BigDecimal deb = lineReq.getDebitAmount() != null ? lineReq.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal cred = lineReq.getCreditAmount() != null ? lineReq.getCreditAmount() : BigDecimal.ZERO;

            if (deb.compareTo(BigDecimal.ZERO) < 0 || cred.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Journal line amounts must be non-negative");
            }
            if (deb.compareTo(BigDecimal.ZERO) > 0 && cred.compareTo(BigDecimal.ZERO) > 0) {
                throw new IllegalArgumentException("A single journal line cannot have both debit and credit amounts");
            }
            if (deb.compareTo(BigDecimal.ZERO) == 0 && cred.compareTo(BigDecimal.ZERO) == 0) {
                throw new IllegalArgumentException("A journal line must specify either a debit or a credit amount");
            }

            totalDebit = totalDebit.add(deb);
            totalCredit = totalCredit.add(cred);
        }

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new IllegalArgumentException(String.format(
                    "Double-entry violation: Total Debits (%s) does not equal Total Credits (%s)",
                    MoneyUtils.formatInr(totalDebit), MoneyUtils.formatInr(totalCredit)));
        }

        if (totalDebit.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("Journal entry total amount cannot be zero");
        }

        // Generate sequential entry number
        long count = journalEntryRepository.countByBusinessId(businessId) + 1;
        String entryNumber = String.format("JE-%s-%04d",
                req.getEntryDate().format(DateTimeFormatter.ofPattern("yyyyMM")), count);

        // Find active financial period if exists
        FinancialPeriod period = financialPeriodRepository
                .findFirstByFinancialYearBusinessIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        businessId, req.getEntryDate(), req.getEntryDate())
                .orElse(null);

        JournalEntry entry = JournalEntry.builder()
                .business(business)
                .entryNumber(entryNumber)
                .entryDate(req.getEntryDate())
                .postingDate(LocalDate.now())
                .referenceNo(req.getReferenceNo())
                .description(req.getDescription())
                .status(JournalStatus.POSTED)
                .sourceType(req.getSourceType() != null ? req.getSourceType() : SourceType.MANUAL)
                .financialPeriod(period)
                .createdBy(user)
                .postedBy(user)
                .build();

        for (JournalLineRequest lineReq : req.getLines()) {
            Account account = accountRepository.findById(lineReq.getAccountId())
                    .filter(a -> a.getBusiness().getId().equals(businessId))
                    .orElseThrow(() -> new IllegalArgumentException("Account not found: " + lineReq.getAccountId()));

            BigDecimal deb = lineReq.getDebitAmount() != null ? lineReq.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal cred = lineReq.getCreditAmount() != null ? lineReq.getCreditAmount() : BigDecimal.ZERO;

            JournalLine line = JournalLine.builder()
                    .account(account)
                    .debitAmount(deb)
                    .creditAmount(cred)
                    .description(lineReq.getDescription() != null ? lineReq.getDescription() : req.getDescription())
                    .build();
            entry.addLine(line);

            // Update Account Balance according to normal balance
            updateAccountBalance(account, deb, cred);
            accountRepository.save(account);
        }

        JournalEntry saved = journalEntryRepository.save(entry);
        return toJournalEntryDto(saved);
    }

    @Transactional
    public JournalEntryDto reverseJournalEntry(UUID businessId, UUID userId, UUID entryId, String reason) {
        JournalEntry original = journalEntryRepository.findById(entryId)
                .filter(e -> e.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new IllegalArgumentException("Journal entry not found"));

        if (original.getStatus() != JournalStatus.POSTED) {
            throw new IllegalArgumentException("Only POSTED entries can be reversed");
        }

        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        original.setStatus(JournalStatus.REVERSED);
        journalEntryRepository.save(original);

        // Create reversal entry with inverted lines
        long count = journalEntryRepository.countByBusinessId(businessId) + 1;
        String reversalNumber = String.format("REV-%s-%04d",
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")), count);

        JournalEntry reversal = JournalEntry.builder()
                .business(original.getBusiness())
                .entryNumber(reversalNumber)
                .entryDate(LocalDate.now())
                .postingDate(LocalDate.now())
                .referenceNo(original.getEntryNumber())
                .description("Reversal of " + original.getEntryNumber() + ": " + (reason != null ? reason : "Correction"))
                .status(JournalStatus.POSTED)
                .sourceType(SourceType.REVERSAL)
                .reversedEntry(original)
                .createdBy(user)
                .postedBy(user)
                .build();

        for (JournalLine origLine : original.getLines()) {
            Account account = origLine.getAccount();
            // Invert debit and credit
            BigDecimal revDeb = origLine.getCreditAmount();
            BigDecimal revCred = origLine.getDebitAmount();

            JournalLine revLine = JournalLine.builder()
                    .account(account)
                    .debitAmount(revDeb)
                    .creditAmount(revCred)
                    .description("Reversal line for " + account.getName())
                    .build();
            reversal.addLine(revLine);

            updateAccountBalance(account, revDeb, revCred);
            accountRepository.save(account);
        }

        JournalEntry savedReversal = journalEntryRepository.save(reversal);
        return toJournalEntryDto(savedReversal);
    }

    @Transactional(readOnly = true)
    public Page<JournalEntryDto> getJournalEntries(UUID businessId, Pageable pageable) {
        return journalEntryRepository.findByBusinessIdOrderByEntryDateDescCreatedAtDesc(businessId, pageable)
                .map(this::toJournalEntryDto);
    }

    @Transactional(readOnly = true)
    public TrialBalanceReport getTrialBalance(UUID businessId, LocalDate asOfDate) {
        if (asOfDate == null) asOfDate = LocalDate.now();

        List<Account> accounts = accountRepository.findByBusinessIdOrderByCodeAsc(businessId);
        List<TrialBalanceItem> items = new ArrayList<>();
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (Account a : accounts) {
            BigDecimal bal = a.getCurrentBalance();
            BigDecimal deb = BigDecimal.ZERO;
            BigDecimal cred = BigDecimal.ZERO;

            if (a.getNormalBalance() == NormalBalance.DEBIT) {
                if (bal.compareTo(BigDecimal.ZERO) >= 0) {
                    deb = bal;
                } else {
                    cred = bal.abs();
                }
            } else {
                if (bal.compareTo(BigDecimal.ZERO) >= 0) {
                    cred = bal;
                } else {
                    deb = bal.abs();
                }
            }

            if (deb.compareTo(BigDecimal.ZERO) != 0 || cred.compareTo(BigDecimal.ZERO) != 0) {
                items.add(TrialBalanceItem.builder()
                        .accountCode(a.getCode())
                        .accountName(a.getName())
                        .accountType(a.getAccountType())
                        .debitBalance(deb)
                        .creditBalance(cred)
                        .build());

                totalDebit = totalDebit.add(deb);
                totalCredit = totalCredit.add(cred);
            }
        }

        boolean isBalanced = totalDebit.compareTo(totalCredit) == 0;

        return TrialBalanceReport.builder()
                .asOfDate(asOfDate)
                .items(items)
                .totalDebit(totalDebit)
                .totalCredit(totalCredit)
                .isBalanced(isBalanced)
                .build();
    }

    @Transactional(readOnly = true)
    public ProfitLossReport getProfitLoss(UUID businessId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.of(LocalDate.now().getYear(), 4, 1);
        if (endDate == null) endDate = LocalDate.now();

        List<Account> revenueAccounts = accountRepository.findByBusinessIdAndAccountType(businessId, AccountType.REVENUE);
        List<Account> expenseAccounts = accountRepository.findByBusinessIdAndAccountType(businessId, AccountType.EXPENSE);

        BigDecimal salesRevenue = revenueAccounts.stream()
                .map(Account::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal cogs = expenseAccounts.stream()
                .filter(a -> "DIRECT_EXPENSE".equalsIgnoreCase(a.getSubCategory()))
                .map(Account::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal grossProfit = salesRevenue.subtract(cogs);
        BigDecimal grossMarginPercent = salesRevenue.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.multiply(new BigDecimal("100")).divide(salesRevenue, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<ExpenseCategoryItem> operatingExpenses = new ArrayList<>();
        BigDecimal totalOperatingExpenses = BigDecimal.ZERO;
        BigDecimal interestExpense = BigDecimal.ZERO;

        for (Account exp : expenseAccounts) {
            if ("DIRECT_EXPENSE".equalsIgnoreCase(exp.getSubCategory())) continue;

            if ("6050".equals(exp.getCode()) || exp.getName().toLowerCase().contains("interest")) {
                interestExpense = interestExpense.add(exp.getCurrentBalance());
            } else {
                operatingExpenses.add(ExpenseCategoryItem.builder()
                        .category(exp.getName())
                        .amount(exp.getCurrentBalance())
                        .build());
                totalOperatingExpenses = totalOperatingExpenses.add(exp.getCurrentBalance());
            }
        }

        BigDecimal operatingProfit = grossProfit.subtract(totalOperatingExpenses);
        BigDecimal netProfit = operatingProfit.subtract(interestExpense);
        BigDecimal netMarginPercent = salesRevenue.compareTo(BigDecimal.ZERO) > 0
                ? netProfit.multiply(new BigDecimal("100")).divide(salesRevenue, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return ProfitLossReport.builder()
                .startDate(startDate)
                .endDate(endDate)
                .salesRevenue(salesRevenue)
                .costOfGoodsSold(cogs)
                .grossProfit(grossProfit)
                .grossMarginPercent(grossMarginPercent)
                .operatingExpenses(operatingExpenses)
                .totalOperatingExpenses(totalOperatingExpenses)
                .operatingProfit(operatingProfit)
                .interestExpense(interestExpense)
                .netProfit(netProfit)
                .netMarginPercent(netMarginPercent)
                .isAudited(false)
                .build();
    }

    @Transactional(readOnly = true)
    public BalanceSheetReport getBalanceSheet(UUID businessId, LocalDate asOfDate) {
        if (asOfDate == null) asOfDate = LocalDate.now();

        List<Account> assets = accountRepository.findByBusinessIdAndAccountType(businessId, AccountType.ASSET);
        List<Account> liabilities = accountRepository.findByBusinessIdAndAccountType(businessId, AccountType.LIABILITY);
        List<Account> equity = accountRepository.findByBusinessIdAndAccountType(businessId, AccountType.EQUITY);

        List<BalanceSheetItem> currentAssets = new ArrayList<>();
        BigDecimal totalAssets = BigDecimal.ZERO;
        for (Account a : assets) {
            currentAssets.add(BalanceSheetItem.builder().accountCode(a.getCode()).accountName(a.getName()).amount(a.getCurrentBalance()).build());
            totalAssets = totalAssets.add(a.getCurrentBalance());
        }

        List<BalanceSheetItem> currentLiabilities = new ArrayList<>();
        BigDecimal totalLiabilities = BigDecimal.ZERO;
        for (Account l : liabilities) {
            currentLiabilities.add(BalanceSheetItem.builder().accountCode(l.getCode()).accountName(l.getName()).amount(l.getCurrentBalance()).build());
            totalLiabilities = totalLiabilities.add(l.getCurrentBalance());
        }

        List<BalanceSheetItem> equityItems = new ArrayList<>();
        BigDecimal equityBase = BigDecimal.ZERO;
        for (Account e : equity) {
            BigDecimal bal = e.getCurrentBalance();
            if ("3100".equals(e.getCode()) || "DRAWINGS".equalsIgnoreCase(e.getSubCategory())) {
                bal = bal.negate(); // drawings reduce equity
            }
            equityItems.add(BalanceSheetItem.builder().accountCode(e.getCode()).accountName(e.getName()).amount(bal).build());
            equityBase = equityBase.add(bal);
        }

        // Net income retained = Revenue - Expense
        ProfitLossReport pnl = getProfitLoss(businessId, null, asOfDate);
        BigDecimal netIncomeRetained = pnl.getNetProfit();
        BigDecimal totalEquity = equityBase.add(netIncomeRetained);
        BigDecimal totalLiabAndEquity = totalLiabilities.add(totalEquity);

        boolean isBalanced = totalAssets.compareTo(totalLiabAndEquity) == 0;

        return BalanceSheetReport.builder()
                .asOfDate(asOfDate)
                .currentAssets(currentAssets)
                .totalCurrentAssets(totalAssets)
                .nonCurrentAssets(Collections.emptyList())
                .totalNonCurrentAssets(BigDecimal.ZERO)
                .totalAssets(totalAssets)
                .currentLiabilities(currentLiabilities)
                .totalCurrentLiabilities(totalLiabilities)
                .nonCurrentLiabilities(Collections.emptyList())
                .totalNonCurrentLiabilities(BigDecimal.ZERO)
                .totalLiabilities(totalLiabilities)
                .equityItems(equityItems)
                .netIncomeRetained(netIncomeRetained)
                .totalEquity(totalEquity)
                .totalLiabilitiesAndEquity(totalLiabAndEquity)
                .isBalanced(isBalanced)
                .build();
    }

    @Transactional(readOnly = true)
    public CashFlowReport getCashFlowReport(UUID businessId, LocalDate startDate, LocalDate endDate) {
        ProfitLossReport pnl = getProfitLoss(businessId, startDate, endDate);
        Optional<Account> cashOpt = accountRepository.findByBusinessIdAndCode(businessId, "1000");
        Optional<Account> bankOpt = accountRepository.findByBusinessIdAndCode(businessId, "1010");

        BigDecimal cashBal = cashOpt.map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);
        BigDecimal bankBal = bankOpt.map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);
        BigDecimal closingCash = cashBal.add(bankBal);

        BigDecimal operatingCashFlow = pnl.getNetProfit(); // Simplified direct cash view
        BigDecimal investingCashFlow = BigDecimal.ZERO;
        BigDecimal financingCashFlow = BigDecimal.ZERO;
        BigDecimal netChange = operatingCashFlow.add(investingCashFlow).add(financingCashFlow);
        BigDecimal openingCash = closingCash.subtract(netChange);

        return CashFlowReport.builder()
                .startDate(startDate)
                .endDate(endDate)
                .netIncome(pnl.getNetProfit())
                .operatingCashFlow(operatingCashFlow)
                .investingCashFlow(investingCashFlow)
                .financingCashFlow(financingCashFlow)
                .netCashChange(netChange)
                .openingCash(openingCash)
                .closingCash(closingCash)
                .build();
    }

    private void updateAccountBalance(Account account, BigDecimal debit, BigDecimal credit) {
        BigDecimal current = account.getCurrentBalance() != null ? account.getCurrentBalance() : BigDecimal.ZERO;
        if (account.getNormalBalance() == NormalBalance.DEBIT) {
            account.setCurrentBalance(current.add(debit).subtract(credit));
        } else {
            account.setCurrentBalance(current.add(credit).subtract(debit));
        }
    }

    private AccountDto toAccountDto(Account a) {
        return AccountDto.builder()
                .id(a.getId())
                .code(a.getCode())
                .name(a.getName())
                .accountType(a.getAccountType())
                .subCategory(a.getSubCategory())
                .normalBalance(a.getNormalBalance())
                .currentBalance(a.getCurrentBalance())
                .system(a.isSystem())
                .active(a.isActive())
                .build();
    }

    private JournalEntryDto toJournalEntryDto(JournalEntry je) {
        List<JournalLineDto> lines = je.getLines().stream()
                .map(l -> JournalLineDto.builder()
                        .id(l.getId())
                        .accountId(l.getAccount().getId())
                        .accountCode(l.getAccount().getCode())
                        .accountName(l.getAccount().getName())
                        .accountType(l.getAccount().getAccountType())
                        .debitAmount(l.getDebitAmount())
                        .creditAmount(l.getCreditAmount())
                        .description(l.getDescription())
                        .build())
                .collect(Collectors.toList());

        BigDecimal totalDeb = lines.stream().map(JournalLineDto::getDebitAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCred = lines.stream().map(JournalLineDto::getCreditAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        return JournalEntryDto.builder()
                .id(je.getId())
                .entryNumber(je.getEntryNumber())
                .entryDate(je.getEntryDate())
                .postingDate(je.getPostingDate())
                .referenceNo(je.getReferenceNo())
                .description(je.getDescription())
                .status(je.getStatus())
                .sourceType(je.getSourceType())
                .lines(lines)
                .totalDebit(totalDeb)
                .totalCredit(totalCred)
                .build();
    }
}
