package com.marginos.purchase.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.common.PageResponse;
import com.marginos.purchase.dto.PurchaseDto.*;
import com.marginos.purchase.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/purchases")
@RequiredArgsConstructor
@Tag(name = "Purchases & Supplier Bills", description = "Purchase bill entry, stock intake, WAVG recalculation, and Accounts Payable tracking")
public class PurchaseController {

    private final PurchaseService purchaseService;
    private final BusinessService businessService;

    @PostMapping
    @Operation(summary = "Record supplier purchase bill (updates stock with WAVG and records A/P)")
    public ResponseEntity<ApiResponse<PurchaseInvoiceResponse>> createPurchase(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CreatePurchaseRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        PurchaseInvoiceResponse response = purchaseService.createPurchase(businessId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Purchase bill recorded", response));
    }

    @GetMapping({"", "/bills", "/invoices"})
    @Operation(summary = "List purchase bills (Paginated)")
    public ResponseEntity<ApiResponse<PageResponse<PurchaseInvoiceResponse>>> getPurchases(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PageableDefault(size = 20) Pageable pageable) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(purchaseService.getPurchases(businessId, pageable))));
    }
}
