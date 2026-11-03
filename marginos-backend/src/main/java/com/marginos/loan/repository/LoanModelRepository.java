package com.marginos.loan.repository;

import com.marginos.loan.model.LoanModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoanModelRepository extends JpaRepository<LoanModel, UUID> {
    List<LoanModel> findByBusinessIdOrderByCreatedAtDesc(UUID businessId);
}
