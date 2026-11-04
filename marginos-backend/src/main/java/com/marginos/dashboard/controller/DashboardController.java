package com.marginos.dashboard.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.dashboard.dto.DashboardDto.*;
import com.marginos.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/dashboard")
@RequiredArgsConstructor
@Tag(name = "Business Dashboard", description = "Aggregated business KPIs: cash position, sales, gross/net margins, inventory health, and trends")
public class DashboardController {

    private final DashboardService dashboardService;
    private final BusinessService businessService;

    @GetMapping({"", "/summary"})
    @Operation(summary = "Get aggregated business dashboard metrics and KPIs")
    public ResponseEntity<ApiResponse<BusinessDashboardSummary>> getDashboardSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboardSummary(businessId)));
    }
}
