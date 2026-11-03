package com.marginos.product.repository;

import com.marginos.product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Page<Product> findByBusinessIdAndActiveTrueOrderByNameAsc(UUID businessId, Pageable pageable);
    List<Product> findByBusinessIdAndActiveTrueOrderByNameAsc(UUID businessId);
    Optional<Product> findByBusinessIdAndSku(UUID businessId, String sku);
    Optional<Product> findByBusinessIdAndBarcode(UUID businessId, String barcode);

    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND p.active = true AND p.currentStock <= p.reorderLevel")
    List<Product> findLowStockProducts(UUID businessId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.business.id = :businessId AND p.active = true")
    long countByBusinessId(UUID businessId);

    @Query("SELECT SUM(p.currentStock * p.weightedAverageCost) FROM Product p WHERE p.business.id = :businessId AND p.active = true")
    java.math.BigDecimal calculateTotalInventoryValuation(UUID businessId);
}
