package com.marginos.accounting;

import com.marginos.accounting.dto.AccountingDto.*;
import com.marginos.accounting.model.*;
import com.marginos.accounting.repository.*;
import com.marginos.accounting.service.AccountingService;
import com.marginos.auth.repository.UserRepository;
import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class DoubleEntryAccountingTest {

    private AccountingService accountingService;
    private AccountRepository accountRepository;
    private JournalEntryRepository journalEntryRepository;
    private JournalLineRepository journalLineRepository;
    private BusinessRepository businessRepository;
    private UserRepository userRepository;
    private FinancialPeriodRepository financialPeriodRepository;

    @BeforeEach
    void setUp() {
        accountRepository = Mockito.mock(AccountRepository.class);
        journalEntryRepository = Mockito.mock(JournalEntryRepository.class);
        journalLineRepository = Mockito.mock(JournalLineRepository.class);
        businessRepository = Mockito.mock(BusinessRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        financialPeriodRepository = Mockito.mock(FinancialPeriodRepository.class);

        when(journalEntryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        accountingService = new AccountingService(
                accountRepository,
                journalEntryRepository,
                journalLineRepository,
                businessRepository,
                userRepository,
                financialPeriodRepository
        );
    }

    @Test
    @DisplayName("Should post balanced journal entry and update account balances correctly")
    void testBalancedJournalEntryPosting() {
        UUID bizId = UUID.randomUUID();
        UUID cashAccId = UUID.randomUUID();
        UUID salesAccId = UUID.randomUUID();

        Business biz = Business.builder().id(bizId).name("Gupta Store").build();
        when(businessRepository.findById(bizId)).thenReturn(Optional.of(biz));

        Account cashAccount = Account.builder()
                .id(cashAccId)
                .business(biz)
                .code("1000")
                .name("Cash in Hand")
                .accountType(AccountType.ASSET)
                .normalBalance(NormalBalance.DEBIT)
                .currentBalance(new BigDecimal("1000.00"))
                .build();

        Account salesAccount = Account.builder()
                .id(salesAccId)
                .business(biz)
                .code("4000")
                .name("Sales Revenue")
                .accountType(AccountType.REVENUE)
                .normalBalance(NormalBalance.CREDIT)
                .currentBalance(new BigDecimal("5000.00"))
                .build();

        when(accountRepository.findById(cashAccId)).thenReturn(Optional.of(cashAccount));
        when(accountRepository.findById(salesAccId)).thenReturn(Optional.of(salesAccount));

        // Create balanced entry: Debit Cash ₹500, Credit Sales ₹500
        CreateJournalEntryRequest req = new CreateJournalEntryRequest();
        req.setEntryDate(LocalDate.now());
        req.setDescription("Cash sale");
        req.setLines(List.of(
                new JournalLineRequest(cashAccId, new BigDecimal("500.00"), BigDecimal.ZERO, "Cash in"),
                new JournalLineRequest(salesAccId, BigDecimal.ZERO, new BigDecimal("500.00"), "Sales Revenue")
        ));

        JournalEntryDto posted = accountingService.postJournalEntry(bizId, null, req);

        assertNotNull(posted);
        assertEquals(JournalStatus.POSTED, posted.getStatus());
        assertEquals(new BigDecimal("500.00"), posted.getTotalDebit());
        assertEquals(new BigDecimal("500.00"), posted.getTotalCredit());

        // Normal balance updates:
        // Cash (DEBIT): 1000 + 500 = 1500
        assertEquals(new BigDecimal("1500.00"), cashAccount.getCurrentBalance().setScale(2));
        // Sales (CREDIT): 5000 + 500 = 5500
        assertEquals(new BigDecimal("5500.00"), salesAccount.getCurrentBalance().setScale(2));
    }

    @Test
    @DisplayName("Should strictly reject unbalanced journal entry (Debits != Credits)")
    void testUnbalancedJournalEntryRejected() {
        UUID bizId = UUID.randomUUID();
        Business biz = Business.builder().id(bizId).name("Gupta Store").build();
        when(businessRepository.findById(bizId)).thenReturn(Optional.of(biz));

        // Debit ₹500, Credit ₹400 -> Unbalanced!
        CreateJournalEntryRequest req = new CreateJournalEntryRequest();
        req.setEntryDate(LocalDate.now());
        req.setDescription("Faulty entry");
        req.setLines(List.of(
                new JournalLineRequest(UUID.randomUUID(), new BigDecimal("500.00"), BigDecimal.ZERO, "Debit side"),
                new JournalLineRequest(UUID.randomUUID(), BigDecimal.ZERO, new BigDecimal("400.00"), "Credit side")
        ));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> accountingService.postJournalEntry(bizId, null, req));

        assertTrue(ex.getMessage().contains("Double-entry violation"));
    }
}
