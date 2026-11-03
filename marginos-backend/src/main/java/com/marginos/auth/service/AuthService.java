package com.marginos.auth.service;

import com.marginos.accounting.model.Account;
import com.marginos.accounting.model.AccountType;
import com.marginos.accounting.model.FinancialYear;
import com.marginos.accounting.model.NormalBalance;
import com.marginos.accounting.repository.AccountRepository;
import com.marginos.accounting.repository.FinancialYearRepository;
import com.marginos.auth.dto.AuthDto.*;
import com.marginos.auth.model.EmailVerification;
import com.marginos.auth.model.PasswordReset;
import com.marginos.auth.model.RefreshToken;
import com.marginos.auth.model.User;
import com.marginos.auth.repository.EmailVerificationRepository;
import com.marginos.auth.repository.PasswordResetRepository;
import com.marginos.auth.repository.RefreshTokenRepository;
import com.marginos.auth.repository.UserRepository;
import com.marginos.business.model.Business;
import com.marginos.business.model.BusinessMembership;
import com.marginos.business.model.BusinessType;
import com.marginos.business.model.OperatingMode;
import com.marginos.business.model.Role;
import com.marginos.business.repository.BusinessMembershipRepository;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.config.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final BusinessRepository businessRepository;
    private final BusinessMembershipRepository membershipRepository;
    private final AccountRepository accountRepository;
    private final FinancialYearRepository financialYearRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final JavaMailSender mailSender;

    @Value("${app.jwt.access-token-expiration-seconds:900}")
    private long accessTokenExpirationSeconds;

    @Value("${app.jwt.refresh-token-expiration-seconds:604800}")
    private long refreshTokenExpirationSeconds;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName().trim())
                .phone(req.getPhone())
                .verified(true) // Auto-verified for local dev convenience
                .active(true)
                .build();
        user = userRepository.save(user);

        // If business name provided or default to user's name
        String bizName = req.getBusinessName() != null && !req.getBusinessName().isBlank()
                ? req.getBusinessName().trim()
                : user.getFullName() + "'s Business";

        Business business = Business.builder()
                .name(bizName)
                .tradeName(bizName)
                .businessType(BusinessType.RETAIL_KIRANA)
                .operatingMode(OperatingMode.QUICK_START)
                .currency("INR")
                .financialYearStartMonth(4)
                .active(true)
                .build();
        business = businessRepository.save(business);

        BusinessMembership membership = BusinessMembership.builder()
                .user(user)
                .business(business)
                .role(Role.OWNER)
                .build();
        membershipRepository.save(membership);

        // Create standard Chart of Accounts for new business
        initializeDefaultAccounts(business);

        // Create current FY
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

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new IllegalArgumentException("Your account has been deactivated. Please contact support.");
        }

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken) {
        String hash = hashToken(rawRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Refresh token has expired or was revoked");
        }

        User user = token.getUser();
        token.setRevoked(true); // Rotate token
        refreshTokenRepository.save(token);

        return createAuthResponse(user);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null) {
            String hash = hashToken(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(hash).ifPresent(t -> {
                t.setRevoked(true);
                refreshTokenRepository.save(t);
            });
        }
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .isVerified(user.isVerified())
                .build();
    }

    @Transactional
    public void sendPasswordResetEmail(String email) {
        userRepository.findByEmail(email.toLowerCase().trim()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            PasswordReset pr = PasswordReset.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(Instant.now().plusSeconds(3600)) // 1 hour
                    .build();
            passwordResetRepository.save(pr);

            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setTo(user.getEmail());
                msg.setSubject("MarginOS Password Reset Request");
                msg.setText("Hello " + user.getFullName() + ",\n\n"
                        + "To reset your MarginOS password, click the link below:\n"
                        + frontendUrl + "/auth/reset-password?token=" + token + "\n\n"
                        + "This link will expire in 1 hour.\n\n"
                        + "If you did not request this, please ignore this email.");
                mailSender.send(msg);
            } catch (Exception e) {
                log.warn("Could not send password reset email to {}: {}", user.getEmail(), e.getMessage());
            }
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordReset pr = passwordResetRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset link"));

        if (pr.getUsedAt() != null || pr.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("This password reset link has already been used or expired");
        }

        User user = pr.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        pr.setUsedAt(Instant.now());
        passwordResetRepository.save(pr);

        // Revoke all existing sessions
        refreshTokenRepository.revokeAllByUser(user);
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String rawRefreshToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID();
        String refreshHash = hashToken(rawRefreshToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(refreshHash)
                .expiresAt(Instant.now().plusSeconds(refreshTokenExpirationSeconds))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        List<BusinessMembership> memberships = membershipRepository.findByUser(user);
        List<BusinessDto> businesses = memberships.stream()
                .map(m -> BusinessDto.builder()
                        .id(m.getBusiness().getId())
                        .name(m.getBusiness().getName())
                        .tradeName(m.getBusiness().getTradeName())
                        .businessType(m.getBusiness().getBusinessType().name())
                        .operatingMode(m.getBusiness().getOperatingMode().name())
                        .currency(m.getBusiness().getCurrency())
                        .role(m.getRole().name())
                        .build())
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .expiresIn(accessTokenExpirationSeconds)
                .user(UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .phone(user.getPhone())
                        .isVerified(user.isVerified())
                        .build())
                .businesses(businesses)
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

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm missing", e);
        }
    }
}
