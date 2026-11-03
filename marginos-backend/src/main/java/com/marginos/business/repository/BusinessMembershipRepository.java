package com.marginos.business.repository;

import com.marginos.auth.model.User;
import com.marginos.business.model.Business;
import com.marginos.business.model.BusinessMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessMembershipRepository extends JpaRepository<BusinessMembership, UUID> {
    List<BusinessMembership> findByUser(User user);
    List<BusinessMembership> findByBusiness(Business business);
    Optional<BusinessMembership> findByUserAndBusiness(User user, Business business);
    Optional<BusinessMembership> findByUserIdAndBusinessId(UUID userId, UUID businessId);
    boolean existsByUserIdAndBusinessId(UUID userId, UUID businessId);
}
