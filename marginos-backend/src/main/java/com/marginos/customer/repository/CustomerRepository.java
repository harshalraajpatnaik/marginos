package com.marginos.customer.repository;

import com.marginos.customer.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Page<Customer> findByBusinessIdAndActiveTrueOrderByNameAsc(UUID businessId, Pageable pageable);
    List<Customer> findByBusinessIdAndActiveTrueOrderByNameAsc(UUID businessId);

    @Query("SELECT SUM(c.currentBalance) FROM Customer c WHERE c.business.id = :businessId AND c.active = true AND c.currentBalance > 0")
    BigDecimal sumTotalReceivables(UUID businessId);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.business.id = :businessId AND c.active = true")
    long countByBusinessId(UUID businessId);
}
