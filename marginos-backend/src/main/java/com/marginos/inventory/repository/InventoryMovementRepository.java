package com.marginos.inventory.repository;

import com.marginos.inventory.model.InventoryMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, UUID> {
    Page<InventoryMovement> findByBusinessIdOrderByMovementDateDescCreatedAtDesc(UUID businessId, Pageable pageable);
    List<InventoryMovement> findByProductIdOrderByMovementDateDesc(UUID productId);
    List<InventoryMovement> findByBusinessIdAndMovementDateBetween(UUID businessId, LocalDate startDate, LocalDate endDate);
}
