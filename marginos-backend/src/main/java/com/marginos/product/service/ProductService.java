package com.marginos.product.service;

import com.marginos.business.model.Business;
import com.marginos.business.repository.BusinessRepository;
import com.marginos.common.MoneyUtils;
import com.marginos.inventory.model.MovementType;
import com.marginos.inventory.service.InventoryService;
import com.marginos.product.dto.ProductDto.*;
import com.marginos.product.model.Product;
import com.marginos.product.model.ProductCategory;
import com.marginos.product.repository.ProductCategoryRepository;
import com.marginos.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final BusinessRepository businessRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(UUID businessId, Pageable pageable) {
        return productRepository.findByBusinessIdAndActiveTrueOrderByNameAsc(businessId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllActiveProducts(UUID businessId) {
        return productRepository.findByBusinessIdAndActiveTrueOrderByNameAsc(businessId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID businessId, UUID productId) {
        Product product = productRepository.findById(productId)
                .filter(p -> p.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(UUID businessId, CreateProductRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));

        ProductCategory category = null;
        if (req.getCategoryId() != null) {
            category = categoryRepository.findById(req.getCategoryId()).orElse(null);
        }

        String sku = req.getSku();
        if (sku == null || sku.isBlank()) {
            sku = "SKU-" + System.currentTimeMillis() % 1000000;
        }

        BigDecimal purchase = req.getPurchasePrice() != null ? req.getPurchasePrice() : BigDecimal.ZERO;
        BigDecimal selling = req.getSellingPrice() != null ? req.getSellingPrice() : BigDecimal.ZERO;
        BigDecimal initialStock = req.getInitialStock() != null ? req.getInitialStock() : BigDecimal.ZERO;

        Product product = Product.builder()
                .business(business)
                .category(category)
                .sku(sku.trim())
                .barcode(req.getBarcode() != null ? req.getBarcode().trim() : null)
                .name(req.getName().trim())
                .description(req.getDescription())
                .unit(req.getUnit() != null ? req.getUnit().toUpperCase() : "PCS")
                .purchasePrice(purchase)
                .sellingPrice(selling)
                .mrp(req.getMrp() != null ? req.getMrp() : selling)
                .taxRate(req.getTaxRate() != null ? req.getTaxRate() : BigDecimal.ZERO)
                .reorderLevel(req.getReorderLevel() != null ? req.getReorderLevel() : new BigDecimal("10.0000"))
                .reorderQuantity(req.getReorderQuantity() != null ? req.getReorderQuantity() : new BigDecimal("20.0000"))
                .currentStock(initialStock)
                .weightedAverageCost(purchase)
                .active(true)
                .build();

        Product saved = productRepository.save(product);

        // Record opening stock movement if initial stock > 0
        if (initialStock.compareTo(BigDecimal.ZERO) > 0) {
            inventoryService.recordMovement(
                    businessId,
                    saved.getId(),
                    MovementType.OPENING,
                    initialStock,
                    purchase,
                    "OPENING_BALANCE",
                    null,
                    "Initial opening stock setup",
                    LocalDate.now()
            );
        }

        return toResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(UUID businessId, UUID productId, CreateProductRequest req) {
        Product product = productRepository.findById(productId)
                .filter(p -> p.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (req.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(req.getCategoryId()).orElse(null));
        }
        if (req.getName() != null) product.setName(req.getName().trim());
        if (req.getSku() != null) product.setSku(req.getSku().trim());
        if (req.getBarcode() != null) product.setBarcode(req.getBarcode().trim());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getUnit() != null) product.setUnit(req.getUnit().toUpperCase());
        if (req.getPurchasePrice() != null) product.setPurchasePrice(req.getPurchasePrice());
        if (req.getSellingPrice() != null) product.setSellingPrice(req.getSellingPrice());
        if (req.getMrp() != null) product.setMrp(req.getMrp());
        if (req.getTaxRate() != null) product.setTaxRate(req.getTaxRate());
        if (req.getReorderLevel() != null) product.setReorderLevel(req.getReorderLevel());
        if (req.getReorderQuantity() != null) product.setReorderQuantity(req.getReorderQuantity());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(UUID businessId, UUID productId) {
        Product product = productRepository.findById(productId)
                .filter(p -> p.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(UUID businessId) {
        return productRepository.findLowStockProducts(businessId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(UUID businessId) {
        return categoryRepository.findByBusinessIdOrderByNameAsc(businessId).stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .description(c.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(UUID businessId, CreateCategoryRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));

        ProductCategory category = ProductCategory.builder()
                .business(business)
                .name(req.getName().trim())
                .description(req.getDescription())
                .build();

        ProductCategory saved = categoryRepository.save(category);
        return CategoryResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .build();
    }

    private ProductResponse toResponse(Product p) {
        BigDecimal wavg = p.getWeightedAverageCost() != null ? p.getWeightedAverageCost() : p.getPurchasePrice();
        BigDecimal stockVal = p.getCurrentStock().multiply(wavg);

        // Gross Profit = Selling - WAVG Cost
        BigDecimal grossProfit = p.getSellingPrice().subtract(wavg);
        // Margin = Gross Profit / Selling Price * 100
        BigDecimal marginPct = p.getSellingPrice().compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.multiply(new BigDecimal("100")).divide(p.getSellingPrice(), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        // Markup = Gross Profit / Cost * 100
        BigDecimal markupPct = wavg.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.multiply(new BigDecimal("100")).divide(wavg, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return ProductResponse.builder()
                .id(p.getId())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : "General")
                .sku(p.getSku())
                .barcode(p.getBarcode())
                .name(p.getName())
                .description(p.getDescription())
                .unit(p.getUnit())
                .purchasePrice(p.getPurchasePrice())
                .sellingPrice(p.getSellingPrice())
                .mrp(p.getMrp())
                .taxRate(p.getTaxRate())
                .reorderLevel(p.getReorderLevel())
                .reorderQuantity(p.getReorderQuantity())
                .currentStock(p.getCurrentStock())
                .weightedAverageCost(wavg)
                .stockValue(stockVal)
                .grossMarginPercent(marginPct)
                .markupPercent(markupPct)
                .isLowStock(p.isLowStock())
                .active(p.isActive())
                .build();
    }
}
