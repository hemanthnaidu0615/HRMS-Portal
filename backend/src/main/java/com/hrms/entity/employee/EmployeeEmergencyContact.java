package com.hrms.entity.employee;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employee Emergency Contact Entity
 * Supports multiple emergency contacts per employee with priority
 */
@Entity
@Table(name = "employee_emergency_contacts")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeEmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    // Priority
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 1;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    // Contact Details
    @Column(name = "contact_name", nullable = false, length = 255)
    private String contactName;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "relationship", nullable = false, length = 100)
    @Enumerated(EnumType.STRING)
    private Relationship relationship;

    @Column(name = "other_relationship", length = 255)
    private String otherRelationship;

    // Phone Numbers
    @Column(name = "primary_phone", nullable = false, length = 50)
    private String primaryPhone;

    @Column(name = "secondary_phone", length = 50)
    private String secondaryPhone;

    @Column(name = "phone_country_code", length = 5)
    private String phoneCountryCode;

    // Email
    @Column(name = "email", length = 255)
    private String email;

    // Address (optional)
    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state_province", length = 100)
    private String stateProvince;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "country", length = 100)
    private String country;

    // Additional Info
    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "best_time_to_contact", length = 100)
    private String bestTimeToContact;

    @Column(name = "speaks_languages", length = 255)
    private String speaksLanguages;

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

    // Relationship Types
    public enum Relationship {
        SPOUSE,
        PARTNER,
        PARENT,
        MOTHER,
        FATHER,
        SIBLING,
        BROTHER,
        SISTER,
        CHILD,
        SON,
        DAUGHTER,
        GRANDPARENT,
        UNCLE,
        AUNT,
        COUSIN,
        NEPHEW,
        NIECE,
        FRIEND,
        COLLEAGUE,
        NEIGHBOR,
        GUARDIAN,
        OTHER
    }
}
