package com.marginos.cashbook.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.cashbook.dto.CashbookDto.*;
import com.marginos.cashbook.service.CashbookService;
import com.marginos.common.ApiResponse;
import com.marginos.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/cashbook")
@RequiredArgsConstructor
@Tag(name = "Mode A: Quick Start Cashbook", description = "Shopkeeper daily cash, sales, expenses, cash count reconciliation, and estimated margins")
public class CashbookController {

    private final CashbookService cashbookService;
    private final BusinessService businessService;

    @PostMapping
    @Operation(summary = "Save or update a daily cashbook entry (Mode A Quick Start)")
    public ResponseEntity<ApiResponse<CashbookEntryResponse>> saveDailyEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody SaveDailyCashbookRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        CashbookEntryResponse response = cashbookService.saveDailyEntry(businessId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Cashbook entry saved", response));
    }

    @GetMapping("/today")
    @Operation(summary = "Get today's cashbook record or a fresh template with yesterday's closing cash")
    public ResponseEntity<ApiResponse<CashbookEntryResponse>> getTodayEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        CashbookEntryResponse response = cashbookService.getEntryByDate(businessId, LocalDate.now());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get cashbook record for a specific date")
    public ResponseEntity<ApiResponse<CashbookEntryResponse>> getEntryByDate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        businessService.verifyMembership(principal.getId(), businessId);
        CashbookEntryResponse response = cashbookService.getEntryByDate(businessId, date);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/history")
    @Operation(summary = "Get paginated cashbook history")
    public ResponseEntity<ApiResponse<PageResponse<CashbookEntryResponse>>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PageableDefault(size = 15) Pageable pageable) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(cashbookService.getHistory(businessId, pageable))));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get shopkeeper cash summary, 7-day trend, and WhatsApp-ready text")
    public ResponseEntity<ApiResponse<CashSummaryResponse>> getSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        CashSummaryResponse response = cashbookService.getSummary(businessId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
