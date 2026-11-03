package com.marginos.csv.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.csv.service.CsvService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/csv")
@RequiredArgsConstructor
@Tag(name = "CSV Import & Export", description = "Export financial records and import product catalogues with formula-injection sanitization")
public class CsvController {

    private final CsvService csvService;
    private final BusinessService businessService;

    @GetMapping("/export/products")
    @Operation(summary = "Export product catalogue to CSV")
    public ResponseEntity<byte[]> exportProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        String csv = csvService.exportProducts(businessId);
        return createCsvResponse(csv, "products.csv");
    }

    @GetMapping("/export/sales")
    @Operation(summary = "Export sales invoices to CSV")
    public ResponseEntity<byte[]> exportSales(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        String csv = csvService.exportSales(businessId);
        return createCsvResponse(csv, "sales.csv");
    }

    @GetMapping("/export/expenses")
    @Operation(summary = "Export expenses to CSV")
    public ResponseEntity<byte[]> exportExpenses(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        String csv = csvService.exportExpenses(businessId);
        return createCsvResponse(csv, "expenses.csv");
    }

    @GetMapping("/export/cashbook")
    @Operation(summary = "Export daily cashbook history to CSV")
    public ResponseEntity<byte[]> exportCashbook(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        String csv = csvService.exportCashbook(businessId);
        return createCsvResponse(csv, "cashbook.csv");
    }

    @GetMapping("/export/trial-balance")
    @Operation(summary = "Export trial balance report to CSV")
    public ResponseEntity<byte[]> exportTrialBalance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        String csv = csvService.exportTrialBalance(businessId);
        return createCsvResponse(csv, "trial_balance.csv");
    }

    @PostMapping("/import/products")
    @Operation(summary = "Import products and stock from a CSV file")
    public ResponseEntity<ApiResponse<Integer>> importProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @RequestParam("file") MultipartFile file) {
        businessService.verifyMembership(principal.getId(), businessId);
        int count = csvService.importProducts(businessId, file);
        return ResponseEntity.ok(ApiResponse.ok("Imported " + count + " products successfully", count));
    }

    private ResponseEntity<byte[]> createCsvResponse(String csvData, String filename) {
        byte[] bytes = csvData.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .contentLength(bytes.length)
                .body(bytes);
    }
}
