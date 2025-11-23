package com.hrms.entity.employee;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.entity.Document;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employee Address Entity
 * Supports multiple addresses per employee (current, permanent, mailing, etc.)
 * Country-agnostic design
 */
@Entity
@Table(name = "employee_addresses")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    // Address Type & Priority
    @Column(name = "address_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AddressType addressType;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    // Address Fields (Country-Agnostic)
    @Column(name = "address_line1", nullable = false, length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(name = "address_line3", length = 255)
    private String addressLine3;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state_province", length = 100)
    private String stateProvince;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "country", nullable = false, length = 100)
    @Builder.Default
    private String country = "United States";

    @Column(name = "country_code", length = 3)
    private String countryCode;

    // Verification
    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proof_document_id")
    private Document proofDocument;

    // Validity Period
    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = true;

    // Status
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // Audit Fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Address Types Enum
    public enum AddressType {
        CURRENT,
        PERMANENT,
        MAILING,
        WORK,
        TEMPORARY
    }

    // Helper method to get formatted address
    public String getFormattedAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(addressLine1);
        if (addressLine2 != null && !addressLine2.isEmpty()) {
            sb.append(", ").append(addressLine2);
        }
        if (addressLine3 != null && !addressLine3.isEmpty()) {
            sb.append(", ").append(addressLine3);
        }
        sb.append(", ").append(city);
        if (stateProvince != null && !stateProvince.isEmpty()) {
            sb.append(", ").append(stateProvince);
        }
        if (postalCode != null && !postalCode.isEmpty()) {
            sb.append(" ").append(postalCode);
        }
        sb.append(", ").append(country);
        return sb.toString();
    }
}
