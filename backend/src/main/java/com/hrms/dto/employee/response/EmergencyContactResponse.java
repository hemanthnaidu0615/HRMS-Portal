package com.hrms.dto.employee.response;

import com.hrms.entity.employee.EmployeeEmergencyContact;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyContactResponse {

    private UUID id;
    private Integer priority;
    private Boolean isPrimary;

    private String firstName;
    private String lastName;
    private String relationship;
    private String otherRelationship;

    private String primaryPhone;
    private String secondaryPhone;
    private String email;

    // Address (simplified)
    private String addressLine1;
    private String city;
    private String stateProvince;
    private String country;

    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EmergencyContactResponse fromEntity(EmployeeEmergencyContact entity) {
        if (entity == null) return null;

        return EmergencyContactResponse.builder()
                .id(entity.getId())
                .priority(entity.getPriority())
                .isPrimary(entity.getIsPrimary())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .relationship(entity.getRelationship() != null ? entity.getRelationship().name() : null)
                .otherRelationship(entity.getOtherRelationship())
                .primaryPhone(entity.getPrimaryPhone())
                .secondaryPhone(entity.getSecondaryPhone())
                .email(entity.getEmail())
                .addressLine1(entity.getAddressLine1())
                .city(entity.getCity())
                .stateProvince(entity.getStateProvince())
                .country(entity.getCountry())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
