package com.marginos.loan.model;

import com.marginos.business.model.Business;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "loan_models")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "lender_name", nullable = false, length = 150)
    private String lenderName;

    @Column(name = "principal_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal principalAmount;

    @Column(name = "annual_interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal annualInterestRate;

    @Column(name = "tenure_months", nullable = false)
    private int tenureMonths;

    @Column(name = "monthly_emi", nullable = false, precision = 19, scale = 4)
    private BigDecimal monthlyEmi;

    @Column(name = "total_interest", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalInterest;

    @Column(name = "total_payment", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalPayment;

    @Column(name = "debt_service_ratio", precision = 5, scale = 2)
    private BigDecimal debtServiceRatio;

    @Column(name = "is_affordable", nullable = false)
    @Builder.Default
    private boolean affordable = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
