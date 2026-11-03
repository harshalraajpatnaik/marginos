package com.marginos.party.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

public class PartyDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateCustomerRequest {
        @NotBlank(message = "Customer name is required")
        private String name;
        private String phone;
        private String email;
        private String gstin;
        private String address;
        private BigDecimal creditLimit = BigDecimal.ZERO;
        private BigDecimal openingBalance = BigDecimal.ZERO;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerResponse {
        private UUID id;
        private String name;
        private String phone;
        private String email;
        private String gstin;
        private String address;
        private BigDecimal creditLimit;
        private BigDecimal openingBalance;
        private BigDecimal currentBalance; // Amount customer owes the shop
        private boolean active;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSupplierRequest {
        @NotBlank(message = "Supplier name is required")
        private String name;
        private String phone;
        private String email;
        private String gstin;
        private String address;
        private int paymentTermsDays = 30;
        private BigDecimal openingBalance = BigDecimal.ZERO;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierResponse {
        private UUID id;
        private String name;
        private String phone;
        private String email;
        private String gstin;
        private String address;
        private int paymentTermsDays;
        private BigDecimal openingBalance;
        private BigDecimal currentBalance; // Amount shop owes the supplier
        private boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgingReport {
        private BigDecimal current;     // 0-30 days
        private BigDecimal thirtyTo60;  // 31-60 days
        private BigDecimal sixtyPlus;   // 60+ days
        private BigDecimal total;
    }
}
