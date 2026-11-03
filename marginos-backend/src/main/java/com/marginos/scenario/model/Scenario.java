package com.marginos.scenario.model;

import com.marginos.business.model.Business;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "scenarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scenario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Baseline inputs
    @Column(name = "base_monthly_revenue", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal baseMonthlyRevenue = BigDecimal.ZERO;

    @Column(name = "base_gross_margin_percent", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal baseGrossMarginPercent = new BigDecimal("20.00");

    @Column(name = "base_monthly_fixed_costs", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal baseMonthlyFixedCosts = BigDecimal.ZERO;

    // Adjustments
    @Column(name = "sales_change_percent", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal salesChangePercent = BigDecimal.ZERO;

    @Column(name = "cost_change_percent", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal costChangePercent = BigDecimal.ZERO;

    @Column(name = "rent_change", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal rentChange = BigDecimal.ZERO;

    @Column(name = "salary_change", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal salaryChange = BigDecimal.ZERO;

    @Column(name = "new_loan_amount", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal newLoanAmount = BigDecimal.ZERO;

    @Column(name = "new_loan_interest_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal newLoanInterestRate = BigDecimal.ZERO;

    @Column(name = "new_loan_tenure_months", nullable = false)
    @Builder.Default
    private int newLoanTenureMonths = 0;

    @Column(name = "new_loan_emi", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal newLoanEmi = BigDecimal.ZERO;

    // Projected outcomes (calculated)
    @Column(name = "projected_revenue", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal projectedRevenue = BigDecimal.ZERO;

    @Column(name = "projected_gross_profit", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal projectedGrossProfit = BigDecimal.ZERO;

    @Column(name = "projected_operating_profit", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal projectedOperatingProfit = BigDecimal.ZERO;

    @Column(name = "projected_breakeven_revenue", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal projectedBreakevenRevenue = BigDecimal.ZERO;

    @Column(name = "is_hypothetical", nullable = false)
    @Builder.Default
    private boolean hypothetical = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
