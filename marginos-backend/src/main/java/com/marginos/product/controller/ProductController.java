package com.marginos.product.controller;

import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import com.marginos.common.PageResponse;
import com.marginos.product.dto.ProductDto.*;
import com.marginos.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/products")
@RequiredArgsConstructor
@Tag(name = "Products & Catalog", description = "Product master catalogue, SKU pricing, tax rates, and category management")
public class ProductController {

    private final ProductService productService;
    private final BusinessService businessService;

    @GetMapping
    @Operation(summary = "List products for the business (Paginated)")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PageableDefault(size = 20) Pageable pageable) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(productService.getProducts(businessId, pageable))));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all active products without pagination for fast autocomplete/dropdowns")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllActiveProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllActiveProducts(businessId)));
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Get detailed product record by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PathVariable UUID productId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductById(businessId, productId)));
    }

    @PostMapping
    @Operation(summary = "Create a new product with initial stock and pricing")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateProductRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        ProductResponse response = productService.createProduct(businessId, request);
        return ResponseEntity.ok(ApiResponse.ok("Product created successfully", response));
    }

    @PutMapping("/{productId}")
    @Operation(summary = "Update product details and pricing")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PathVariable UUID productId,
            @Valid @RequestBody CreateProductRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        ProductResponse response = productService.updateProduct(businessId, productId, request);
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", response));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Deactivate product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @PathVariable UUID productId) {
        businessService.verifyMembership(principal.getId(), businessId);
        productService.deleteProduct(businessId, productId);
        return ResponseEntity.ok(ApiResponse.ok("Product deactivated", null));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock products needing reordering")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(productService.getLowStockProducts(businessId)));
    }

    @GetMapping("/categories")
    @Operation(summary = "List all product categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(productService.getCategories(businessId)));
    }

    @PostMapping("/categories")
    @Operation(summary = "Create a product category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateCategoryRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok("Category created", productService.createCategory(businessId, request)));
    }
}
