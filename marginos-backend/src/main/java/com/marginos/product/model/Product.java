package com.marginos.product.model;

import com.marginos.business.model.Business;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "products", uniqueConstraints = {
        @UniqueConstraint(name = "uk_business_product_sku", columnNames = {"business_id", "sku"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProductCategory category;

    @Column(length = 100)
    private String sku;

    @Column(length = 100)
    private String barcode;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String unit = "PCS"; // PCS, KG, LITRE, BOX, PACKET, METER

    @Column(name = "purchase_price", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Column(name = "selling_price", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal mrp = BigDecimal.ZERO;

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "reorder_level", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal reorderLevel = new BigDecimal("10.0000");

    @Column(name = "reorder_quantity", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal reorderQuantity = new BigDecimal("20.0000");

    @Column(name = "current_stock", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Column(name = "weighted_average_cost", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal weightedAverageCost = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public boolean isLowStock() {
        return currentStock.compareTo(reorderLevel) <= 0;
    }
}
