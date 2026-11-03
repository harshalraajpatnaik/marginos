package com.marginos.sales.repository;

import com.marginos.sales.model.SalesInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, UUID> {
    Page<SalesInvoice> findByBusinessIdOrderByInvoiceDateDescCreatedAtDesc(UUID businessId, Pageable pageable);
    List<SalesInvoice> findByBusinessIdAndInvoiceDateBetween(UUID businessId, LocalDate startDate, LocalDate endDate);
    Optional<SalesInvoice> findByBusinessIdAndInvoiceNumber(UUID businessId, String invoiceNumber);

    @Query("SELECT COUNT(s) FROM SalesInvoice s WHERE s.business.id = :businessId")
    long countByBusinessId(UUID businessId);

    @Query("SELECT SUM(s.totalAmount) FROM SalesInvoice s WHERE s.business.id = :businessId AND s.invoiceDate = :date AND s.status != 'CANCELLED'")
    BigDecimal sumDailySales(UUID businessId, LocalDate date);

    @Query("SELECT SUM(s.totalAmount) FROM SalesInvoice s WHERE s.business.id = :businessId AND s.invoiceDate BETWEEN :startDate AND :endDate AND s.status != 'CANCELLED'")
    BigDecimal sumRangeSales(UUID businessId, LocalDate startDate, LocalDate endDate);
}
