package com.marginos.budget.model;

import com.marginos.business.model.Business;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "forecasts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Forecast {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "projected_growth_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal projectedGrowthRate = new BigDecimal("5.00");

    @Column(name = "expected_revenue", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal expectedRevenue = BigDecimal.ZERO;

    @Column(name = "expected_expenses", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal expectedExpenses = BigDecimal.ZERO;

    @Column(name = "expected_cash_balance", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal expectedCashBalance = BigDecimal.ZERO;

    @Column(name = "confidence_score", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal confidenceScore = new BigDecimal("70.00");

    @Column(columnDefinition = "TEXT")
    private String assumptions;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
