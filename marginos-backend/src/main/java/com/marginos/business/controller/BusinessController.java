package com.marginos.business.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.dto.BusinessDto.*;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses")
@RequiredArgsConstructor
@Tag(name = "Business Workspaces", description = "Multi-tenant workspace creation, configuration, and operating mode switching")
public class BusinessController {

    private final BusinessService businessService;

    @PostMapping
    @Operation(summary = "Create a new business workspace")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> createBusiness(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateBusinessRequest request) {
        BusinessDetailResponse response = businessService.createBusiness(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Business workspace created", response));
    }

    @GetMapping
    @Operation(summary = "List all business workspaces the authenticated user belongs to")
    public ResponseEntity<ApiResponse<List<BusinessDetailResponse>>> getUserBusinesses(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<BusinessDetailResponse> businesses = businessService.getUserBusinesses(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(businesses));
    }

    @GetMapping("/{businessId}")
    @Operation(summary = "Get specific business workspace details (Tenant Protected)")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> getBusinessById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        BusinessDetailResponse response = businessService.getBusinessById(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{businessId}")
    @Operation(summary = "Update business workspace details (Owner or Admin only)")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> updateBusiness(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestBody UpdateBusinessRequest request) {
        BusinessDetailResponse response = businessService.updateBusiness(principal.getId(), businessId, request);
        return ResponseEntity.ok(ApiResponse.ok("Business details updated", response));
    }

    @PatchMapping("/{businessId}/mode")
    @Operation(summary = "Switch operating mode (Quick Start vs Detailed Mode vs Simulator)")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> changeOperatingMode(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestBody ChangeOperatingModeRequest request) {
        BusinessDetailResponse response = businessService.updateOperatingMode(principal.getId(), businessId, request.getOperatingMode());
        return ResponseEntity.ok(ApiResponse.ok("Operating mode updated", response));
    }
}
