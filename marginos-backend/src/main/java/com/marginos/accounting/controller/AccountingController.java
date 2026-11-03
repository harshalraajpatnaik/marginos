package com.marginos.accounting.controller;

import com.marginos.accounting.dto.AccountingDto.*;
import com.marginos.accounting.service.AccountingService;
import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
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
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/accounting")
@RequiredArgsConstructor
@Tag(name = "Accounting & Financial Statements", description = "Chart of accounts, double-entry journal, trial balance, P&L, balance sheet, and cash flow")
public class AccountingController {

    private final AccountingService accountingService;
    private final BusinessService businessService;

    @GetMapping("/accounts")
    @Operation(summary = "Get standard Chart of Accounts for the business")
    public ResponseEntity<ApiResponse<List<AccountDto>>> getAccounts(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        List<AccountDto> accounts = accountingService.getAccounts(businessId);
        return ResponseEntity.ok(ApiResponse.ok(accounts));
    }

    @PostMapping("/accounts")
    @Operation(summary = "Add a custom account to the Chart of Accounts")
    public ResponseEntity<ApiResponse<AccountDto>> createAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateAccountRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        AccountDto account = accountingService.createAccount(businessId, request);
        return ResponseEntity.ok(ApiResponse.ok("Account created in Chart of Accounts", account));
    }

    @GetMapping("/journal-entries")
    @Operation(summary = "List posted and reversed journal entries (Paginated)")
    public ResponseEntity<ApiResponse<PageResponse<JournalEntryDto>>> getJournalEntries(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PageableDefault(size = 20) Pageable pageable) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(accountingService.getJournalEntries(businessId, pageable))));
    }

    @PostMapping("/journal-entries")
    @Operation(summary = "Post a new double-entry journal entry (Debits MUST equal Credits)")
    public ResponseEntity<ApiResponse<JournalEntryDto>> postJournalEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateJournalEntryRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        JournalEntryDto entry = accountingService.postJournalEntry(businessId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Journal entry posted successfully", entry));
    }

    @PostMapping("/journal-entries/{entryId}/reverse")
    @Operation(summary = "Create an immutable reversal entry for a previously posted journal entry")
    public ResponseEntity<ApiResponse<JournalEntryDto>> reverseJournalEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PathVariable UUID entryId,
            @RequestParam(required = false) String reason) {
        businessService.verifyMembership(principal.getId(), businessId);
        JournalEntryDto reversal = accountingService.reverseJournalEntry(businessId, principal.getId(), entryId, reason);
        return ResponseEntity.ok(ApiResponse.ok("Reversal entry posted successfully", reversal));
    }

    @GetMapping("/trial-balance")
    @Operation(summary = "Generate Trial Balance report as of a specified date")
    public ResponseEntity<ApiResponse<TrialBalanceReport>> getTrialBalance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        businessService.verifyMembership(principal.getId(), businessId);
        TrialBalanceReport report = accountingService.getTrialBalance(businessId, asOfDate);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/profit-loss")
    @Operation(summary = "Generate Profit and Loss Statement for a specified date range")
    public ResponseEntity<ApiResponse<ProfitLossReport>> getProfitLoss(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        businessService.verifyMembership(principal.getId(), businessId);
        ProfitLossReport report = accountingService.getProfitLoss(businessId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/balance-sheet")
    @Operation(summary = "Generate Balance Sheet Statement as of a specified date")
    public ResponseEntity<ApiResponse<BalanceSheetReport>> getBalanceSheet(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        businessService.verifyMembership(principal.getId(), businessId);
        BalanceSheetReport report = accountingService.getBalanceSheet(businessId, asOfDate);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/cash-flow")
    @Operation(summary = "Generate Cash Flow Statement for a specified date range")
    public ResponseEntity<ApiResponse<CashFlowReport>> getCashFlow(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        businessService.verifyMembership(principal.getId(), businessId);
        CashFlowReport report = accountingService.getCashFlowReport(businessId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }
}
