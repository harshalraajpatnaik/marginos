package com.marginos.business.service;

import com.marginos.accounting.model.Account;
import com.marginos.accounting.model.AccountType;
import com.marginos.accounting.model.FinancialYear;
import com.marginos.accounting.model.NormalBalance;
import com.marginos.accounting.repository.AccountRepository;
import com.marginos.accounting.repository.FinancialYearRepository;
import com.marginos.auth.model.User;
import com.marginos.auth.repository.UserRepository;
import com.marginos.business.dto.BusinessDto.*;
import com.marginos.business.model.Business;
import com.marginos.business.model.BusinessMembership;
import com.marginos.business.model.OperatingMode;
import com.marginos.business.model.Role;
import com.marginos.business.repository.BusinessMembershipRepository;
import com.marginos.business.repository.BusinessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final BusinessMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final FinancialYearRepository financialYearRepository;

    @Transactional
    public BusinessDetailResponse createBusiness(UUID userId, CreateBusinessRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Business business = Business.builder()
                .name(req.getName().trim())
                .tradeName(req.getTradeName() != null ? req.getTradeName().trim() : req.getName().trim())
                .businessType(req.getBusinessType())
                .operatingMode(req.getOperatingMode())
                .currency(req.getCurrency() != null ? req.getCurrency() : "INR")
                .gstin(req.getGstin())
                .pan(req.getPan())
                .address(req.getAddress())
                .city(req.getCity())
                .state(req.getState())
                .pinCode(req.getPinCode())
                .phone(req.getPhone())
                .email(req.getEmail())
                .active(true)
                .build();
        business = businessRepository.save(business);

        BusinessMembership membership = BusinessMembership.builder()
                .user(user)
                .business(business)
                .role(Role.OWNER)
                .build();
        membershipRepository.save(membership);

        initializeDefaultAccounts(business);

        LocalDate now = LocalDate.now();
        int fyStartYear = now.getMonthValue() >= 4 ? now.getYear() : now.getYear() - 1;
        FinancialYear fy = FinancialYear.builder()
                .business(business)
                .name("FY " + fyStartYear + "-" + (fyStartYear + 1) % 100)
                .startDate(LocalDate.of(fyStartYear, 4, 1))
                .endDate(LocalDate.of(fyStartYear + 1, 3, 31))
                .closed(false)
                .build();
        financialYearRepository.save(fy);

        return toDetailResponse(business, Role.OWNER);
    }

    @Transactional(readOnly = true)
    public List<BusinessDetailResponse> getUserBusinesses(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return membershipRepository.findByUser(user).stream()
                .map(m -> toDetailResponse(m.getBusiness(), m.getRole()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BusinessDetailResponse getBusinessById(UUID userId, UUID businessId) {
        BusinessMembership membership = verifyMembership(userId, businessId);
        return toDetailResponse(membership.getBusiness(), membership.getRole());
    }

    @Transactional
    public BusinessDetailResponse updateOperatingMode(UUID userId, UUID businessId, OperatingMode mode) {
        BusinessMembership membership = verifyMembership(userId, businessId);
        Business business = membership.getBusiness();
        business.setOperatingMode(mode);
        business = businessRepository.save(business);
        return toDetailResponse(business, membership.getRole());
    }

    @Transactional
    public BusinessDetailResponse updateBusiness(UUID userId, UUID businessId, UpdateBusinessRequest req) {
        BusinessMembership membership = verifyMembership(userId, businessId);
        if (membership.getRole() != Role.OWNER && membership.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Owner or Admin can update business profile");
        }

        Business b = membership.getBusiness();
        if (req.getName() != null && !req.getName().isBlank()) b.setName(req.getName().trim());
        if (req.getTradeName() != null) b.setTradeName(req.getTradeName().trim());
        if (req.getBusinessType() != null) b.setBusinessType(req.getBusinessType());
        if (req.getOperatingMode() != null) b.setOperatingMode(req.getOperatingMode());
        if (req.getGstin() != null) b.setGstin(req.getGstin().trim());
        if (req.getPan() != null) b.setPan(req.getPan().trim());
        if (req.getAddress() != null) b.setAddress(req.getAddress());
        if (req.getCity() != null) b.setCity(req.getCity());
        if (req.getState() != null) b.setState(req.getState());
        if (req.getPinCode() != null) b.setPinCode(req.getPinCode());
        if (req.getPhone() != null) b.setPhone(req.getPhone());
        if (req.getEmail() != null) b.setEmail(req.getEmail());

        b = businessRepository.save(b);
        return toDetailResponse(b, membership.getRole());
    }

    /**
     * Centralized Tenant Isolation Enforcer
     * Throws AccessDeniedException if the user is not a verified member of this business
     */
    public BusinessMembership verifyMembership(UUID userId, UUID businessId) {
        return membershipRepository.findByUserIdAndBusinessId(userId, businessId)
                .orElseThrow(() -> new AccessDeniedException("Access denied: You do not have access to this business workspace"));
    }

    public Business verifyAndGetBusiness(UUID userId, UUID businessId) {
        return verifyMembership(userId, businessId).getBusiness();
    }

    private BusinessDetailResponse toDetailResponse(Business b, Role role) {
        return BusinessDetailResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .tradeName(b.getTradeName())
                .gstin(b.getGstin())
                .pan(b.getPan())
                .businessType(b.getBusinessType())
                .operatingMode(b.getOperatingMode())
                .currency(b.getCurrency())
                .financialYearStartMonth(b.getFinancialYearStartMonth())
                .address(b.getAddress())
                .city(b.getCity())
                .state(b.getState())
                .pinCode(b.getPinCode())
                .phone(b.getPhone())
                .email(b.getEmail())
                .role(role != null ? role.name() : "STAFF")
                .active(b.isActive())
                .build();
    }

    private void initializeDefaultAccounts(Business business) {
        List<Account> accounts = List.of(
                Account.builder().business(business).code("1000").name("Cash in Hand").accountType(AccountType.ASSET).subCategory("CASH").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("1010").name("Bank Account").accountType(AccountType.ASSET).subCategory("BANK").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("1100").name("Accounts Receivable").accountType(AccountType.ASSET).subCategory("RECEIVABLES").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("1200").name("Inventory").accountType(AccountType.ASSET).subCategory("INVENTORY").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("2000").name("Accounts Payable").accountType(AccountType.LIABILITY).subCategory("PAYABLES").normalBalance(NormalBalance.CREDIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("2100").name("GST Payable").accountType(AccountType.LIABILITY).subCategory("TAX").normalBalance(NormalBalance.CREDIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("2200").name("Input GST (ITC)").accountType(AccountType.ASSET).subCategory("TAX").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("2300").name("Business Loans").accountType(AccountType.LIABILITY).subCategory("PAYABLES").normalBalance(NormalBalance.CREDIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("3000").name("Owner's Capital").accountType(AccountType.EQUITY).subCategory("CAPITAL").normalBalance(NormalBalance.CREDIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("3100").name("Owner Drawings").accountType(AccountType.EQUITY).subCategory("DRAWINGS").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("4000").name("Sales Revenue").accountType(AccountType.REVENUE).subCategory("SALES_REVENUE").normalBalance(NormalBalance.CREDIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("5000").name("Cost of Goods Sold").accountType(AccountType.EXPENSE).subCategory("DIRECT_EXPENSE").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("6000").name("Rent Expense").accountType(AccountType.EXPENSE).subCategory("INDIRECT_EXPENSE").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("6010").name("Salaries & Wages").accountType(AccountType.EXPENSE).subCategory("INDIRECT_EXPENSE").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("6020").name("Utilities & Power").accountType(AccountType.EXPENSE).subCategory("INDIRECT_EXPENSE").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("6030").name("Transport & Freight").accountType(AccountType.EXPENSE).subCategory("INDIRECT_EXPENSE").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("6050").name("Loan Interest").accountType(AccountType.EXPENSE).subCategory("INDIRECT_EXPENSE").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build(),
                Account.builder().business(business).code("6060").name("Misc Expenses").accountType(AccountType.EXPENSE).subCategory("INDIRECT_EXPENSE").normalBalance(NormalBalance.DEBIT).system(true).currentBalance(BigDecimal.ZERO).build()
        );
        accountRepository.saveAll(accounts);
    }
}
