package com.marginos.accounting.repository;

import com.marginos.accounting.model.JournalLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface JournalLineRepository extends JpaRepository<JournalLine, UUID> {
    List<JournalLine> findByAccountId(UUID accountId);

    @Query("SELECT jl FROM JournalLine jl JOIN jl.journalEntry je " +
           "WHERE jl.account.id = :accountId AND je.entryDate BETWEEN :startDate AND :endDate AND je.status = 'POSTED' " +
           "ORDER BY je.entryDate ASC, je.createdAt ASC")
    List<JournalLine> findLedgerLines(UUID accountId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(jl.debitAmount) FROM JournalLine jl JOIN jl.journalEntry je " +
           "WHERE jl.account.id = :accountId AND je.status = 'POSTED' AND je.entryDate <= :asOfDate")
    BigDecimal sumDebitByAccount(UUID accountId, LocalDate asOfDate);

    @Query("SELECT SUM(jl.creditAmount) FROM JournalLine jl JOIN jl.journalEntry je " +
           "WHERE jl.account.id = :accountId AND je.status = 'POSTED' AND je.entryDate <= :asOfDate")
    BigDecimal sumCreditByAccount(UUID accountId, LocalDate asOfDate);
}
