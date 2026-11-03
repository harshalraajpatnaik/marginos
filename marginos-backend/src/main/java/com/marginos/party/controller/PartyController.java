package com.marginos.party.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.common.PageResponse;
import com.marginos.party.dto.PartyDto.*;
import com.marginos.party.service.PartyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}")
@RequiredArgsConstructor
@Tag(name = "Parties: Customers & Suppliers", description = "Customer credit (Khata), supplier payables, aging analysis, and settlement tracking")
public class PartyController {

    private final PartyService partyService;
    private final BusinessService businessService;

    // --- Customers ---

    @GetMapping("/customers")
    @Operation(summary = "List customers (Paginated)")
    public ResponseEntity<ApiResponse<PageResponse<CustomerResponse>>> getCustomers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PageableDefault(size = 20) Pageable pageable) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(partyService.getCustomers(businessId, pageable))));
    }

    @GetMapping("/customers/all")
    @Operation(summary = "Get all active customers for dropdowns/autocomplete")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(partyService.getAllCustomers(businessId)));
    }

    @PostMapping("/customers")
    @Operation(summary = "Add a new customer with opening balance and credit limit")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateCustomerRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok("Customer created", partyService.createCustomer(businessId, request)));
    }

    @PostMapping("/customers/{customerId}/payment")
    @Operation(summary = "Record customer payment / collection (decreases customer balance)")
    public ResponseEntity<ApiResponse<Void>> recordCustomerPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PathVariable UUID customerId,
            @RequestParam BigDecimal amount) {
        businessService.verifyMembership(principal.getId(), businessId);
        partyService.recordCustomerPayment(businessId, customerId, amount);
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded successfully", null));
    }

    @GetMapping("/receivables/aging")
    @Operation(summary = "Get Accounts Receivable aging report (Current, 30-60d, 60d+)")
    public ResponseEntity<ApiResponse<AgingReport>> getReceivablesAging(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(partyService.getReceivablesAging(businessId)));
    }

    // --- Suppliers ---

    @GetMapping("/suppliers")
    @Operation(summary = "List suppliers (Paginated)")
    public ResponseEntity<ApiResponse<PageResponse<SupplierResponse>>> getSuppliers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PageableDefault(size = 20) Pageable pageable) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(partyService.getSuppliers(businessId, pageable))));
    }

    @GetMapping("/suppliers/all")
    @Operation(summary = "Get all active suppliers for dropdowns/autocomplete")
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> getAllSuppliers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(partyService.getAllSuppliers(businessId)));
    }

    @PostMapping("/suppliers")
    @Operation(summary = "Add a new supplier with payment terms and opening balance")
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateSupplierRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok("Supplier created", partyService.createSupplier(businessId, request)));
    }

    @PostMapping("/suppliers/{supplierId}/payment")
    @Operation(summary = "Record supplier payment (decreases amount owed)")
    public ResponseEntity<ApiResponse<Void>> recordSupplierPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PathVariable UUID supplierId,
            @RequestParam BigDecimal amount) {
        businessService.verifyMembership(principal.getId(), businessId);
        partyService.recordSupplierPayment(businessId, supplierId, amount);
        return ResponseEntity.ok(ApiResponse.ok("Supplier payment recorded successfully", null));
    }

    @GetMapping("/payables/aging")
    @Operation(summary = "Get Accounts Payable aging report (Current, 30-60d, 60d+)")
    public ResponseEntity<ApiResponse<AgingReport>> getPayablesAging(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(partyService.getPayablesAging(businessId)));
    }
}
