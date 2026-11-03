package com.marginos.business.dto;

import com.marginos.business.model.BusinessType;
import com.marginos.business.model.OperatingMode;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class BusinessDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBusinessRequest {
        @NotBlank(message = "Business name is required")
        private String name;
        private String tradeName;
        private BusinessType businessType = BusinessType.RETAIL_KIRANA;
        private OperatingMode operatingMode = OperatingMode.QUICK_START;
        private String currency = "INR";
        private String gstin;
        private String pan;
        private String address;
        private String city;
        private String state;
        private String pinCode;
        private String phone;
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateBusinessRequest {
        private String name;
        private String tradeName;
        private BusinessType businessType;
        private OperatingMode operatingMode;
        private String gstin;
        private String pan;
        private String address;
        private String city;
        private String state;
        private String pinCode;
        private String phone;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusinessDetailResponse {
        private UUID id;
        private String name;
        private String tradeName;
        private String gstin;
        private String pan;
        private BusinessType businessType;
        private OperatingMode operatingMode;
        private String currency;
        private int financialYearStartMonth;
        private String address;
        private String city;
        private String state;
        private String pinCode;
        private String phone;
        private String email;
        private String role;
        private boolean active;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangeOperatingModeRequest {
        private OperatingMode operatingMode;
    }
}
