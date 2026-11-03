package com.marginos.supplier.repository;

import com.marginos.supplier.model.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    Page<Supplier> findByBusinessIdAndActiveTrueOrderByNameAsc(UUID businessId, Pageable pageable);
    List<Supplier> findByBusinessIdAndActiveTrueOrderByNameAsc(UUID businessId);

    @Query("SELECT SUM(s.currentBalance) FROM Supplier s WHERE s.business.id = :businessId AND s.active = true AND s.currentBalance > 0")
    BigDecimal sumTotalPayables(UUID businessId);

    @Query("SELECT COUNT(s) FROM Supplier s WHERE s.business.id = :businessId AND s.active = true")
    long countByBusinessId(UUID businessId);
}
