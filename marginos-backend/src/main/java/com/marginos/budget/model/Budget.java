package com.marginos.budget.model;

import com.marginos.accounting.model.FinancialYear;
import com.marginos.business.model.Business;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "budgets", uniqueConstraints = {
        @UniqueConstraint(name = "uk_business_budget_month", columnNames = {"business_id", "year", "month_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "financial_year_id")
    private FinancialYear financialYear;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "month_number", nullable = false)
    private int monthNumber;

    @Column(nullable = false)
    private int year;

    @Column(name = "budgeted_revenue", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal budgetedRevenue = BigDecimal.ZERO;

    @Column(name = "budgeted_cogs", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal budgetedCogs = BigDecimal.ZERO;

    @Column(name = "budgeted_expenses", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal budgetedExpenses = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
