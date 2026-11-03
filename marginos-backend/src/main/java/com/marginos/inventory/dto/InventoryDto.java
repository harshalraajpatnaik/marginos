package com.marginos.inventory.dto;

import com.marginos.inventory.model.MovementType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class InventoryDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockAdjustmentRequest {
        @NotNull(message = "Product ID is required")
        private UUID productId;

        @NotNull(message = "Adjustment quantity is required")
        private BigDecimal quantity; // Positive for surplus, negative for damage/loss

        private BigDecimal unitCost;
        private String reason; // e.g. "Physical count variance", "Damaged goods", "Expired"
        private LocalDate date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovementResponse {
        private UUID id;
        private UUID productId;
        private String productName;
        private String sku;
        private MovementType movementType;
        private BigDecimal quantity;
        private BigDecimal unitCost;
        private BigDecimal totalCost;
        private String referenceType;
        private String notes;
        private LocalDate movementDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryValuationResponse {
        private BigDecimal totalStockValue;
        private int totalSkus;
        private int lowStockCount;
        private List<ProductValuationItem> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductValuationItem {
        private UUID productId;
        private String sku;
        private String name;
        private String unit;
        private BigDecimal currentStock;
        private BigDecimal weightedAverageCost;
        private BigDecimal valuation;
        private boolean isLowStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AbcAnalysisResponse {
        private List<AbcItem> classA; // Top ~70% revenue items
        private List<AbcItem> classB; // Next ~20% revenue items
        private List<AbcItem> classC; // Bottom ~10% revenue items
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AbcItem {
        private UUID productId;
        private String sku;
        private String name;
        private BigDecimal salesRevenue;
        private BigDecimal revenueSharePercent;
        private BigDecimal cumulativePercent;
        private String classification; // 'A', 'B', 'C'
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlowMovingItem {
        private UUID productId;
        private String sku;
        private String name;
        private BigDecimal currentStock;
        private BigDecimal stockValue;
        private LocalDate lastSoldDate;
        private int daysSinceLastMovement;
        private String recommendation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EoqCalculationResponse {
        private UUID productId;
        private String productName;
        private BigDecimal annualDemand;
        private BigDecimal orderingCost;
        private BigDecimal holdingCostPerUnit;
        private BigDecimal economicOrderQuantity; // Optimal order size
        private BigDecimal optimalOrdersPerYear;
        private String explanation;
    }
}
