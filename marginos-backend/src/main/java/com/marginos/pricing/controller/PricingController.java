package com.marginos.pricing.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.pricing.dto.PricingDto.*;
import com.marginos.pricing.service.PricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/pricing")
@RequiredArgsConstructor
@Tag(name = "Pricing & Margins", description = "Price calculation, Margin vs Markup analysis, discount simulation, and minimum viable price")
public class PricingController {

    private final PricingService pricingService;
    private final BusinessService businessService;

    @PostMapping("/calculate")
    @Operation(summary = "Calculate gross margin, markup, contribution margin, discount impact, and minimum viable selling price")
    public ResponseEntity<ApiResponse<PricingCalculationResponse>> calculatePricing(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody PricingCalculationRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(pricingService.calculatePricing(request)));
    }
}
