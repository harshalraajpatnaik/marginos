package com.marginos.purchase.repository;

import com.marginos.purchase.model.PurchaseInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, UUID> {
    Page<PurchaseInvoice> findByBusinessIdOrderByBillDateDescCreatedAtDesc(UUID businessId, Pageable pageable);
    List<PurchaseInvoice> findByBusinessIdAndBillDateBetween(UUID businessId, LocalDate startDate, LocalDate endDate);
    Optional<PurchaseInvoice> findByBusinessIdAndBillNumber(UUID businessId, String billNumber);
}
