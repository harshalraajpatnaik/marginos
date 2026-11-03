package com.marginos.cashbook.repository;

import com.marginos.cashbook.model.CashbookEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CashbookEntryRepository extends JpaRepository<CashbookEntry, UUID> {
    Optional<CashbookEntry> findByBusinessIdAndEntryDate(UUID businessId, LocalDate entryDate);
    Page<CashbookEntry> findByBusinessIdOrderByEntryDateDesc(UUID businessId, Pageable pageable);
    List<CashbookEntry> findByBusinessIdAndEntryDateBetweenOrderByEntryDateAsc(
            UUID businessId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT c FROM CashbookEntry c WHERE c.business.id = :businessId ORDER BY c.entryDate DESC LIMIT 1")
    Optional<CashbookEntry> findLatestByBusinessId(UUID businessId);
}
