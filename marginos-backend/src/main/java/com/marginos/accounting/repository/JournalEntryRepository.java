package com.marginos.accounting.repository;

import com.marginos.accounting.model.JournalEntry;
import com.marginos.accounting.model.JournalStatus;
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
public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {
    Page<JournalEntry> findByBusinessIdOrderByEntryDateDescCreatedAtDesc(UUID businessId, Pageable pageable);
    List<JournalEntry> findByBusinessIdAndEntryDateBetweenAndStatus(
            UUID businessId, LocalDate startDate, LocalDate endDate, JournalStatus status);
    Optional<JournalEntry> findByBusinessIdAndEntryNumber(UUID businessId, String entryNumber);

    @Query("SELECT COUNT(j) FROM JournalEntry j WHERE j.business.id = :businessId")
    long countByBusinessId(UUID businessId);
}
