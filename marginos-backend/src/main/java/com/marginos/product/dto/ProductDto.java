package com.marginos.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

public class ProductDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProductRequest {
        private UUID categoryId;
        private String sku;
        private String barcode;

        @NotBlank(message = "Product name is required")
        private String name;

        private String description;
        private String unit = "PCS";

        @NotNull(message = "Purchase price is required")
        private BigDecimal purchasePrice;

        @NotNull(message = "Selling price is required")
        private BigDecimal sellingPrice;

        private BigDecimal mrp;
        private BigDecimal taxRate = BigDecimal.ZERO;
        private BigDecimal reorderLevel = new BigDecimal("10.0000");
        private BigDecimal reorderQuantity = new BigDecimal("20.0000");
        private BigDecimal initialStock = BigDecimal.ZERO;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductResponse {
        private UUID id;
        private UUID categoryId;
        private String categoryName;
        private String sku;
        private String barcode;
        private String name;
        private String description;
        private String unit;
        private BigDecimal purchasePrice;
        private BigDecimal sellingPrice;
        private BigDecimal mrp;
        private BigDecimal taxRate;
        private BigDecimal reorderLevel;
        private BigDecimal reorderQuantity;
        private BigDecimal currentStock;
        private BigDecimal weightedAverageCost;
        private BigDecimal stockValue;
        private BigDecimal grossMarginPercent;
        private BigDecimal markupPercent;
        private boolean isLowStock;
        private boolean active;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateCategoryRequest {
        @NotBlank(message = "Category name is required")
        private String name;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private UUID id;
        private String name;
        private String description;
    }
}
