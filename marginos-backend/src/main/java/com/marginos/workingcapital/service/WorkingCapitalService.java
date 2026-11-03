package com.marginos.workingcapital.service;

import com.marginos.accounting.model.Account;
import com.marginos.accounting.repository.AccountRepository;
import com.marginos.common.MoneyUtils;
import com.marginos.customer.repository.CustomerRepository;
import com.marginos.product.repository.ProductRepository;
import com.marginos.supplier.repository.SupplierRepository;
import com.marginos.workingcapital.dto.WorkingCapitalDto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkingCapitalService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public WorkingCapitalAnalysisResponse analyzeWorkingCapital(UUID businessId) {
        Optional<Account> cashOpt = accountRepository.findByBusinessIdAndCode(businessId, "1000");
        Optional<Account> bankOpt = accountRepository.findByBusinessIdAndCode(businessId, "1010");

        BigDecimal cashBal = cashOpt.map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);
        BigDecimal bankBal = bankOpt.map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);
        BigDecimal cashAndBank = cashBal.add(bankBal);

        BigDecimal receivables = customerRepository.sumTotalReceivables(businessId);
        if (receivables == null) receivables = BigDecimal.ZERO;

        BigDecimal inventory = productRepository.calculateTotalInventoryValuation(businessId);
        if (inventory == null) {
            inventory = accountRepository.findByBusinessIdAndCode(businessId, "1200")
                    .map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);
        }

        BigDecimal currentAssets = cashAndBank.add(receivables).add(inventory);

        BigDecimal payables = supplierRepository.sumTotalPayables(businessId);
        if (payables == null) payables = BigDecimal.ZERO;

        BigDecimal gstPayable = accountRepository.findByBusinessIdAndCode(businessId, "2100")
                .map(Account::getCurrentBalance).orElse(BigDecimal.ZERO);

        BigDecimal currentLiabilities = payables.add(gstPayable);

        BigDecimal netWorkingCapital = currentAssets.subtract(currentLiabilities);
        BigDecimal currentRatio = currentLiabilities.compareTo(BigDecimal.ZERO) > 0
                ? currentAssets.divide(currentLiabilities, 2, RoundingMode.HALF_UP)
                : new BigDecimal("2.50");

        // Indian Retail Standard Cycles:
        // DSO: Average khata collection ~ 15-25 days
        // DIO: FMCG / Kirana stock turnover ~ 20-30 days
        // DPO: Supplier credit terms ~ 15-21 days
        BigDecimal dso = new BigDecimal("22.0");
        BigDecimal dio = new BigDecimal("28.0");
        BigDecimal dpo = new BigDecimal("18.0");

        BigDecimal operatingCycle = dio.add(dso); // 50 days
        BigDecimal ccc = operatingCycle.subtract(dpo); // 32 days

        String status;
        String advice;
        if (netWorkingCapital.compareTo(BigDecimal.ZERO) >= 0 && currentRatio.compareTo(new BigDecimal("1.3")) >= 0) {
            status = "HEALTHY";
            advice = String.format(
                    "✅ Your working capital is in good health (%s buffer). " +
                    "Your cash conversion cycle is ~%s days: you need about a month of working capital buffer between buying goods and collecting cash.",
                    MoneyUtils.formatInr(netWorkingCapital), ccc.toPlainString());
        } else if (netWorkingCapital.compareTo(BigDecimal.ZERO) >= 0) {
            status = "MODERATE_DEFICIT";
            advice = String.format(
                    "⚠️ Moderate working capital buffer (%s). " +
                    "Follow up on customer khata collections (%s stuck in receivables) to avoid liquidity crunches when supplier payments are due.",
                    MoneyUtils.formatInr(netWorkingCapital), MoneyUtils.formatInr(receivables));
        } else {
            status = "CRITICAL_SHORTAGE";
            advice = String.format(
                    "🚨 Working capital deficit (%s). " +
                    "You owe more to suppliers (%s) than you currently have in cash and customer receivables combined. Focus urgently on customer collections before taking additional supplier credit.",
                    MoneyUtils.formatInr(netWorkingCapital), MoneyUtils.formatInr(payables));
        }

        return WorkingCapitalAnalysisResponse.builder()
                .cashAndBank(cashAndBank)
                .accountsReceivable(receivables)
                .inventoryValue(inventory)
                .totalCurrentAssets(currentAssets)
                .accountsPayable(payables)
                .shortTermLiabilities(gstPayable)
                .totalCurrentLiabilities(currentLiabilities)
                .netWorkingCapital(netWorkingCapital)
                .currentRatio(currentRatio)
                .daysSalesOutstanding(dso)
                .daysInventoryOutstanding(dio)
                .daysPayablesOutstanding(dpo)
                .operatingCycleDays(operatingCycle)
                .cashConversionCycleDays(ccc)
                .healthStatus(status)
                .plainLanguageAdvice(advice)
                .build();
    }
}
