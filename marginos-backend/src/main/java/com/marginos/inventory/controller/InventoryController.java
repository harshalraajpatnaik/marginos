package com.marginos.inventory.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.common.PageResponse;
import com.marginos.inventory.dto.InventoryDto.*;
import com.marginos.inventory.model.MovementType;
import com.marginos.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory & Stock Analysis", description = "Stock movements, weighted-average cost valuation, ABC analysis, slow-moving items, and EOQ")
public class InventoryController {

    private final InventoryService inventoryService;
    private final BusinessService businessService;

    @GetMapping("/movements")
    @Operation(summary = "Get historical stock movements (Purchases, Sales, Adjustments)")
    public ResponseEntity<ApiResponse<PageResponse<MovementResponse>>> getMovements(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PageableDefault(size = 20) Pageable pageable) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(inventoryService.getMovements(businessId, pageable))));
    }

    @PostMapping("/adjustments")
    @Operation(summary = "Record physical inventory count adjustment or damaged stock write-off")
    public ResponseEntity<ApiResponse<MovementResponse>> recordAdjustment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        var movement = inventoryService.recordMovement(
                businessId,
                request.getProductId(),
                MovementType.ADJUSTMENT,
                request.getQuantity(),
                request.getUnitCost(),
                "STOCKTAKE_ADJUSTMENT",
                null,
                request.getReason(),
                request.getDate()
        );
        return ResponseEntity.ok(ApiResponse.ok("Stock adjustment recorded",
                MovementResponse.builder()
                        .id(movement.getId())
                        .productId(movement.getProduct().getId())
                        .productName(movement.getProduct().getName())
                        .sku(movement.getProduct().getSku())
                        .movementType(movement.getMovementType())
                        .quantity(movement.getQuantity())
                        .unitCost(movement.getUnitCost())
                        .totalCost(movement.getTotalCost())
                        .notes(movement.getNotes())
                        .movementDate(movement.getMovementDate())
                        .build()));
    }

    @GetMapping("/valuation")
    @Operation(summary = "Get total stock valuation calculated using Weighted-Average Cost (WAVG)")
    public ResponseEntity<ApiResponse<InventoryValuationResponse>> getValuation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getInventoryValuation(businessId)));
    }

    @GetMapping("/abc-analysis")
    @Operation(summary = "Run ABC Analysis: Class A (top 70%), Class B (next 20%), Class C (tail 10%)")
    public ResponseEntity<ApiResponse<AbcAnalysisResponse>> getAbcAnalysis(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getAbcAnalysis(businessId)));
    }

    @GetMapping("/slow-moving")
    @Operation(summary = "Identify slow-moving and dead stock items with days since last movement")
    public ResponseEntity<ApiResponse<List<SlowMovingItem>>> getSlowMoving(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestParam(required = false, defaultValue = "45") Integer thresholdDays) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getSlowMovingItems(businessId, thresholdDays)));
    }

    @GetMapping("/eoq")
    @Operation(summary = "Calculate Economic Order Quantity (EOQ) for a product")
    public ResponseEntity<ApiResponse<EoqCalculationResponse>> calculateEoq(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestParam UUID productId,
            @RequestParam(required = false) BigDecimal annualDemand,
            @RequestParam(required = false) BigDecimal orderingCost,
            @RequestParam(required = false) BigDecimal holdingCostRate) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.calculateEoq(businessId, productId, annualDemand, orderingCost, holdingCostRate)));
    }
}
