package com.marginos.business.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "businesses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "trade_name")
    private String tradeName;

    private String gstin;

    private String pan;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_type", nullable = false)
    @Builder.Default
    private BusinessType businessType = BusinessType.RETAIL_KIRANA;

    @Enumerated(EnumType.STRING)
    @Column(name = "operating_mode", nullable = false)
    @Builder.Default
    private OperatingMode operatingMode = OperatingMode.QUICK_START;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "financial_year_start_month", nullable = false)
    @Builder.Default
    private int financialYearStartMonth = 4; // April for India

    private String address;

    private String city;

    private String state;

    @Column(name = "pin_code")
    private String pinCode;

    private String phone;

    private String email;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
