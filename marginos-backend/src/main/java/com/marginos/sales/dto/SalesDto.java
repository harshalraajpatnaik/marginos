package com.marginos.sales.dto;

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

public class SalesDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSalesInvoiceRequest {
        @NotNull(message = "Invoice date is required")
        private LocalDate invoiceDate;

        private LocalDate dueDate;
        private UUID customerId;

        @NotBlank(message = "Customer name is required")
        private String customerName;

        private String customerPhone;

        private BigDecimal discountAmount = BigDecimal.ZERO;
        private String paymentMode = "CASH"; // CASH, UPI, CARD, BANK_TRANSFER, CREDIT
        private BigDecimal paidAmount;
        private String notes;

        @NotEmpty(message = "Invoice must contain at least one line item")
        private List<SalesLineRequest> lines;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesLineRequest {
        private UUID productId;

        @NotBlank(message = "Product name is required")
        private String productName;

        @NotNull(message = "Quantity is required")
        private BigDecimal quantity;

        @NotNull(message = "Unit price is required")
        private BigDecimal unitPrice;

        private BigDecimal discountPercent = BigDecimal.ZERO;
        private BigDecimal taxRate = BigDecimal.ZERO;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuickSaleRequest {
        @NotNull(message = "Sale amount is required")
        private BigDecimal amount;

        private String paymentMode = "CASH";
        private String description = "Counter Cash Sale";
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesInvoiceResponse {
        private UUID id;
        private String invoiceNumber;
        private LocalDate invoiceDate;
        private LocalDate dueDate;
        private UUID customerId;
        private String customerName;
        private String customerPhone;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal balanceAmount;
        private String paymentMode;
        private String status;
        private String notes;
        private UUID journalEntryId;
        private List<SalesLineResponse> lines;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesLineResponse {
        private UUID id;
        private UUID productId;
        private String productName;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private BigDecimal costPrice;
        private BigDecimal discountAmount;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
    }
}
