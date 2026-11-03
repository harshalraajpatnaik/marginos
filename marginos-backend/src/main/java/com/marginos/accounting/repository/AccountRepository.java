package com.marginos.accounting.repository;

import com.marginos.accounting.model.Account;
import com.marginos.accounting.model.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    List<Account> findByBusinessIdAndActiveTrueOrderByCodeAsc(UUID businessId);
    List<Account> findByBusinessIdOrderByCodeAsc(UUID businessId);
    List<Account> findByBusinessIdAndAccountType(UUID businessId, AccountType accountType);
    Optional<Account> findByBusinessIdAndCode(UUID businessId, String code);
    Optional<Account> findByBusinessIdAndSubCategory(UUID businessId, String subCategory);
    boolean existsByBusinessIdAndCode(UUID businessId, String code);
}
