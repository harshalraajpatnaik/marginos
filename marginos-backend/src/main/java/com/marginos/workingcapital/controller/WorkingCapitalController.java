package com.marginos.workingcapital.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.workingcapital.dto.WorkingCapitalDto.*;
import com.marginos.workingcapital.service.WorkingCapitalService;
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
@RequestMapping("/api/v1/businesses/{businessId}/working-capital")
@RequiredArgsConstructor
@Tag(name = "Working Capital & Cash Conversion", description = "Current assets vs liabilities, Operating Cycle, Cash Conversion Cycle (CCC), and liquidity health")
public class WorkingCapitalController {

    private final WorkingCapitalService workingCapitalService;
    private final BusinessService businessService;

    @GetMapping
    @Operation(summary = "Analyze business working capital position, Cash Conversion Cycle, and buffer requirements")
    public ResponseEntity<ApiResponse<WorkingCapitalAnalysisResponse>> analyzeWorkingCapital(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(workingCapitalService.analyzeWorkingCapital(businessId)));
    }
}
