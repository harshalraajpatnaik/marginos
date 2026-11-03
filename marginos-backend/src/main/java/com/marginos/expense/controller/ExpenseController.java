package com.marginos.expense.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.common.PageResponse;
import com.marginos.expense.dto.ExpenseDto.*;
import com.marginos.expense.service.ExpenseService;
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
@RequestMapping("/api/v1/businesses/{businessId}/expenses")
@RequiredArgsConstructor
@Tag(name = "Operating Expenses", description = "Expense categorization, recurring tracking, and category breakdown analysis")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final BusinessService businessService;

    @PostMapping
    @Operation(summary = "Record business expense with category and payment mode")
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateExpenseRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        ExpenseResponse response = expenseService.createExpense(businessId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Expense recorded", response));
    }

    @GetMapping
    @Operation(summary = "List business expenses (Paginated)")
    public ResponseEntity<ApiResponse<PageResponse<ExpenseResponse>>> getExpenses(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PageableDefault(size = 20) Pageable pageable) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(expenseService.getExpenses(businessId, pageable))));
    }

    @GetMapping("/breakdown")
    @Operation(summary = "Get expense breakdown report by category with percentage distribution")
    public ResponseEntity<ApiResponse<ExpenseBreakdownReport>> getBreakdown(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getBreakdown(businessId, startDate, endDate)));
    }
}
