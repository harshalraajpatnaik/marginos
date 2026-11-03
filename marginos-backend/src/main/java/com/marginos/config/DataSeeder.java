package com.marginos.config;

import com.marginos.auth.model.User;
import com.marginos.auth.repository.UserRepository;
import com.marginos.business.model.Business;
import com.marginos.business.model.BusinessMembership;
import com.marginos.business.model.Role;
import com.marginos.business.repository.BusinessMembershipRepository;
import com.marginos.business.repository.BusinessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final BusinessMembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Verifying initial demo accounts and passwords...");

        // Ensure demo user password is valid
        Optional<User> demoUserOpt = userRepository.findByEmail("harshal@marginos.internal");
        User demoUser;
        if (demoUserOpt.isPresent()) {
            demoUser = demoUserOpt.get();
            demoUser.setPasswordHash(passwordEncoder.encode("MarginOS@123"));
            demoUser.setVerified(true);
            demoUser.setActive(true);
            userRepository.save(demoUser);
            log.info("Demo user 'harshal@marginos.internal' updated with verified credentials.");
        } else {
            demoUser = User.builder()
                    .id(UUID.fromString("a0000000-0000-0000-0000-000000000001"))
                    .email("harshal@marginos.internal")
                    .passwordHash(passwordEncoder.encode("MarginOS@123"))
                    .fullName("Harshal Raaj Patnaik")
                    .phone("+919876543210")
                    .verified(true)
                    .active(true)
                    .build();
            userRepository.save(demoUser);
            log.info("Demo user 'harshal@marginos.internal' created with initial credentials.");
        }

        // Verify membership
        Optional<Business> demoBizOpt = businessRepository.findById(UUID.fromString("b0000000-0000-0000-0000-000000000001"));
        if (demoBizOpt.isPresent()) {
            Business demoBiz = demoBizOpt.get();
            if (!membershipRepository.existsByUserIdAndBusinessId(demoUser.getId(), demoBiz.getId())) {
                BusinessMembership membership = BusinessMembership.builder()
                        .user(demoUser)
                        .business(demoBiz)
                        .role(Role.OWNER)
                        .build();
                membershipRepository.save(membership);
                log.info("Linked demo user to demo business 'Gupta Kirana & General Store'.");
            }
        }
    }
}
