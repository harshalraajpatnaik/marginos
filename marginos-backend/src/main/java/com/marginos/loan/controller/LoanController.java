package com.marginos.loan.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.loan.dto.LoanDto.*;
import com.marginos.loan.service.LoanService;
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
@RequestMapping("/api/v1/businesses/{businessId}/loan")
@RequiredArgsConstructor
@Tag(name = "Loan & Financing Analysis", description = "Calculate monthly EMI, amortization schedule, total interest, and business debt-service affordability")
public class LoanController {

    private final LoanService loanService;
    private final BusinessService businessService;

    @PostMapping("/calculate")
    @Operation(summary = "Calculate loan EMI, full repayment schedule, total interest, and DSCR affordability")
    public ResponseEntity<ApiResponse<LoanCalculationResponse>> calculateLoan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CalculateLoanRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(loanService.calculateLoan(businessId, request)));
    }

    @PostMapping("/save")
    @Operation(summary = "Save loan model scenario for comparison")
    public ResponseEntity<ApiResponse<SavedLoanResponse>> saveLoanModel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CalculateLoanRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok("Loan model saved", loanService.saveLoanModel(businessId, request)));
    }

    @GetMapping("/saved")
    @Operation(summary = "List saved loan scenarios for this business")
    public ResponseEntity<ApiResponse<List<SavedLoanResponse>>> getSavedLoanModels(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(loanService.getSavedLoanModels(businessId)));
    }
}
