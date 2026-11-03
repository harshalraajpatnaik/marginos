package com.marginos.scenario.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.scenario.dto.ScenarioDto.*;
import com.marginos.scenario.service.ScenarioService;
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
@RequestMapping("/api/v1/businesses/{businessId}/scenarios")
@RequiredArgsConstructor
@Tag(name = "Mode C: Business Scenario Simulator", description = "Simulate what-if changes (sales volume, rent hike, hiring, loans, cost changes) side-by-side with baseline")
public class ScenarioController {

    private final ScenarioService scenarioService;
    private final BusinessService businessService;

    @PostMapping("/simulate")
    @Operation(summary = "Run a what-if scenario simulation and save for side-by-side comparison (strictly hypothetical)")
    public ResponseEntity<ApiResponse<ScenarioComparisonResponse>> simulateScenario(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody SimulateScenarioRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok("Scenario simulation generated", scenarioService.simulateAndSave(businessId, request)));
    }

    @GetMapping
    @Operation(summary = "List saved scenario simulations for the business")
    public ResponseEntity<ApiResponse<List<ScenarioComparisonResponse>>> getScenarios(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(scenarioService.getScenarios(businessId)));
    }
}
