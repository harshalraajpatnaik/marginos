package com.marginos.cashbook.model;

import com.marginos.accounting.model.JournalEntry;
import com.marginos.auth.model.User;
import com.marginos.business.model.Business;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "cashbook_entries", uniqueConstraints = {
        @UniqueConstraint(name = "uk_business_entry_date", columnNames = {"business_id", "entry_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashbookEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "opening_cash", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal openingCash = BigDecimal.ZERO;

    @Column(name = "cash_sales", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal cashSales = BigDecimal.ZERO;

    @Column(name = "digital_sales", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal digitalSales = BigDecimal.ZERO;

    @Column(name = "credit_sales", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal creditSales = BigDecimal.ZERO;

    @Column(name = "cash_purchases", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal cashPurchases = BigDecimal.ZERO;

    @Column(name = "operating_expenses", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal operatingExpenses = BigDecimal.ZERO;

    @Column(name = "customer_collections", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal customerCollections = BigDecimal.ZERO;

    @Column(name = "supplier_payments", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal supplierPayments = BigDecimal.ZERO;

    @Column(name = "cash_deposits", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal cashDeposits = BigDecimal.ZERO;

    @Column(name = "cash_withdrawals", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal cashWithdrawals = BigDecimal.ZERO;

    @Column(name = "owner_capital", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal ownerCapital = BigDecimal.ZERO;

    @Column(name = "owner_drawings", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal ownerDrawings = BigDecimal.ZERO;

    @Column(name = "loan_received", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal loanReceived = BigDecimal.ZERO;

    @Column(name = "loan_repaid", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal loanRepaid = BigDecimal.ZERO;

    @Column(name = "calculated_closing_cash", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal calculatedClosingCash = BigDecimal.ZERO;

    @Column(name = "counted_cash", precision = 19, scale = 4)
    private BigDecimal countedCash;

    @Column(name = "cash_variance", precision = 19, scale = 4)
    private BigDecimal cashVariance;

    @Column(name = "estimated_cost_of_goods", precision = 19, scale = 4)
    private BigDecimal estimatedCostOfGoods;

    @Column(name = "estimated_gross_profit", precision = 19, scale = 4)
    private BigDecimal estimatedGrossProfit;

    @Column(name = "estimated_net_profit", precision = 19, scale = 4)
    private BigDecimal estimatedNetProfit;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_closed", nullable = false)
    @Builder.Default
    private boolean closed = false;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    private JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Recalculates closing cash balance according to accounting formula:
     * Closing = Opening + Inflows - Outflows
     */
    public void calculateTotals() {
        BigDecimal totalInflows = cashSales
                .add(customerCollections != null ? customerCollections : BigDecimal.ZERO)
                .add(cashWithdrawals != null ? cashWithdrawals : BigDecimal.ZERO) // Bank withdrawal into cash
                .add(ownerCapital != null ? ownerCapital : BigDecimal.ZERO)
                .add(loanReceived != null ? loanReceived : BigDecimal.ZERO);

        BigDecimal totalOutflows = (cashPurchases != null ? cashPurchases : BigDecimal.ZERO)
                .add(operatingExpenses != null ? operatingExpenses : BigDecimal.ZERO)
                .add(supplierPayments != null ? supplierPayments : BigDecimal.ZERO)
                .add(cashDeposits != null ? cashDeposits : BigDecimal.ZERO) // Cash deposited into bank
                .add(ownerDrawings != null ? ownerDrawings : BigDecimal.ZERO)
                .add(loanRepaid != null ? loanRepaid : BigDecimal.ZERO);

        this.calculatedClosingCash = (openingCash != null ? openingCash : BigDecimal.ZERO)
                .add(totalInflows)
                .subtract(totalOutflows);

        if (this.countedCash != null) {
            this.cashVariance = this.countedCash.subtract(this.calculatedClosingCash);
        } else {
            this.cashVariance = BigDecimal.ZERO;
        }

        // Estimate Gross Profit: Total Sales (Cash + Digital + Credit)
        BigDecimal totalSales = cashSales
                .add(digitalSales != null ? digitalSales : BigDecimal.ZERO)
                .add(creditSales != null ? creditSales : BigDecimal.ZERO);

        if (this.estimatedCostOfGoods != null && this.estimatedCostOfGoods.compareTo(BigDecimal.ZERO) > 0) {
            this.estimatedGrossProfit = totalSales.subtract(this.estimatedCostOfGoods);
            this.estimatedNetProfit = this.estimatedGrossProfit.subtract(
                    operatingExpenses != null ? operatingExpenses : BigDecimal.ZERO);
        } else {
            // Default conservative estimate: Indian retail typical gross margin ~ 15-20%
            this.estimatedCostOfGoods = totalSales.multiply(new BigDecimal("0.80"));
            this.estimatedGrossProfit = totalSales.subtract(this.estimatedCostOfGoods);
            this.estimatedNetProfit = this.estimatedGrossProfit.subtract(
                    operatingExpenses != null ? operatingExpenses : BigDecimal.ZERO);
        }
    }
}
