package com.marginos.budget.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.budget.dto.BudgetDto.*;
import com.marginos.budget.model.Budget;
import com.marginos.budget.service.BudgetService;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets & Forecasting", description = "Monthly budget targets, revenue/expense tracking, and budget vs actual variance analysis")
public class BudgetController {

    private final BudgetService budgetService;
    private final BusinessService businessService;

    @PostMapping
    @Operation(summary = "Save or update a monthly revenue, COGS, and expense budget")
    public ResponseEntity<ApiResponse<Budget>> saveBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody SaveBudgetRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok("Budget saved", budgetService.saveBudget(businessId, request)));
    }

    @GetMapping("/variance")
    @Operation(summary = "Get budget vs actual variance analysis for a specific year and month")
    public ResponseEntity<ApiResponse<BudgetVarianceResponse>> getVariance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestParam int year,
            @RequestParam int month) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(budgetService.getMonthlyVariance(businessId, year, month)));
    }

    @GetMapping("/annual")
    @Operation(summary = "Get full 12-month annual budget comparison and performance overview")
    public ResponseEntity<ApiResponse<AnnualBudgetComparison>> getAnnualComparison(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestParam int year) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(budgetService.getAnnualComparison(businessId, year)));
    }
}
