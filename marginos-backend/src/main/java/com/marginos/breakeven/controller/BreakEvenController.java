package com.marginos.breakeven.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.breakeven.dto.BreakEvenDto.*;
import com.marginos.breakeven.service.BreakEvenService;
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
@RequestMapping("/api/v1/businesses/{businessId}/breakeven")
@RequiredArgsConstructor
@Tag(name = "Break-Even Analysis", description = "Calculate sales volume required to cover fixed overheads, margin of safety, and price sensitivity")
public class BreakEvenController {

    private final BreakEvenService breakEvenService;
    private final BusinessService businessService;

    @PostMapping("/calculate")
    @Operation(summary = "Calculate monthly and daily break-even targets, margin of safety, and sensitivity table")
    public ResponseEntity<ApiResponse<BreakEvenCalculationResponse>> calculateBreakEven(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody BreakEvenCalculationRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(breakEvenService.calculateBreakEven(request)));
    }
}
