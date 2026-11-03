package com.marginos.loan;

import com.marginos.accounting.service.AccountingService;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.loan.dto.LoanDto.CalculateLoanRequest;
import com.marginos.loan.dto.LoanDto.LoanCalculationResponse;
import com.marginos.loan.repository.LoanModelRepository;
import com.marginos.loan.service.LoanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class LoanServiceTest {

    private LoanService loanService;

    @BeforeEach
    void setUp() {
        LoanModelRepository repo = Mockito.mock(LoanModelRepository.class);
        BusinessRepository bizRepo = Mockito.mock(BusinessRepository.class);
        AccountingService accService = Mockito.mock(AccountingService.class);
        loanService = new LoanService(repo, bizRepo, accService);
    }

    @Test
    @DisplayName("Should accurately calculate loan EMI using banking amortization formula")
    void testLoanEmiCalculation() {
        // Principal = ₹1,00,000 | Interest = 12% p.a. | Tenure = 12 months
        // Expected EMI = ₹8,884.88
        // Total Payment = ₹1,06,618.55
        // Total Interest = ₹6,618.55
        CalculateLoanRequest req = new CalculateLoanRequest();
        req.setPrincipalAmount(new BigDecimal("100000.00"));
        req.setAnnualInterestRatePercent(new BigDecimal("12.00"));
        req.setTenureMonths(12);

        LoanCalculationResponse resp = loanService.calculateLoan(UUID.randomUUID(), req);

        assertNotNull(resp);
        assertEquals(new BigDecimal("8884.88"), resp.getMonthlyEmi().setScale(2));
        assertEquals(12, resp.getSchedule().size());

        // Check first month breakdown
        var month1 = resp.getSchedule().get(0);
        assertEquals(new BigDecimal("100000.00"), month1.getBeginningBalance().setScale(2));
        assertEquals(new BigDecimal("1000.00"), month1.getInterestPaid().setScale(2)); // 1% of 100k = 1000
        assertEquals(new BigDecimal("7884.88"), month1.getPrincipalPaid().setScale(2));

        // Check final month ending balance is zero
        var month12 = resp.getSchedule().get(11);
        assertEquals(new BigDecimal("0.00"), month12.getEndingBalance().setScale(2));
    }
}
