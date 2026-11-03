package com.marginos.sales.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.common.PageResponse;
import com.marginos.sales.dto.SalesDto.*;
import com.marginos.sales.service.SalesService;
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
@RequestMapping("/api/v1/businesses/{businessId}/sales")
@RequiredArgsConstructor
@Tag(name = "Sales & Invoicing", description = "Sales invoice creation, fast counter sales, and automatic double-entry and inventory synchronization")
public class SalesController {

    private final SalesService salesService;
    private final BusinessService businessService;

    @PostMapping
    @Operation(summary = "Create a detailed sales invoice with inventory deduction and journal posting")
    public ResponseEntity<ApiResponse<SalesInvoiceResponse>> createInvoice(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateSalesInvoiceRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        SalesInvoiceResponse response = salesService.createInvoice(businessId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Sales invoice created", response));
    }

    @PostMapping("/quick")
    @Operation(summary = "Shopkeeper Fast Sale: 1-click counter sale entry")
    public ResponseEntity<ApiResponse<SalesInvoiceResponse>> createQuickSale(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody QuickSaleRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        SalesInvoiceResponse response = salesService.createQuickSale(businessId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Quick sale recorded", response));
    }

    @GetMapping
    @Operation(summary = "List sales invoices (Paginated)")
    public ResponseEntity<ApiResponse<PageResponse<SalesInvoiceResponse>>> getInvoices(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PageableDefault(size = 20) Pageable pageable) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(salesService.getInvoices(businessId, pageable))));
    }

    @GetMapping("/{invoiceId}")
    @Operation(summary = "Get specific sales invoice details")
    public ResponseEntity<ApiResponse<SalesInvoiceResponse>> getInvoiceById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PathVariable UUID invoiceId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(salesService.getInvoiceById(businessId, invoiceId)));
    }
}
