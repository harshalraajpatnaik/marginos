package com.marginos.purchase.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class PurchaseDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePurchaseRequest {
        @NotBlank(message = "Bill number is required")
        private String billNumber;

        @NotNull(message = "Bill date is required")
        private LocalDate billDate;

        private LocalDate dueDate;
        private UUID supplierId;

        @NotBlank(message = "Supplier name is required")
        private String supplierName;

        private BigDecimal discountAmount = BigDecimal.ZERO;
        private String paymentMode = "CASH"; // CASH, UPI, BANK_TRANSFER, CREDIT
        private BigDecimal paidAmount;
        private String notes;

        @NotEmpty(message = "Purchase must contain at least one line item")
        private List<PurchaseLineRequest> lines;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseLineRequest {
        private UUID productId;

        @NotBlank(message = "Product name is required")
        private String productName;

        @NotNull(message = "Quantity is required")
        private BigDecimal quantity;

        @NotNull(message = "Unit cost is required")
        private BigDecimal unitCost;

        private BigDecimal taxRate = BigDecimal.ZERO;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseInvoiceResponse {
        private UUID id;
        private String billNumber;
        private LocalDate billDate;
        private LocalDate dueDate;
        private UUID supplierId;
        private String supplierName;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal balanceAmount;
        private String paymentMode;
        private String status;
        private String notes;
        private List<PurchaseLineResponse> lines;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseLineResponse {
        private UUID id;
        private UUID productId;
        private String productName;
        private BigDecimal quantity;
        private BigDecimal unitCost;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
    }
}
