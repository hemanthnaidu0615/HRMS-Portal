package com.hrms.dto.employee.response;

import com.hrms.entity.employee.EmployeeAddress;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {

    private UUID id;
    private String addressType;
    private Boolean isPrimary;

    private String addressLine1;
    private String addressLine2;
    private String addressLine3;
    private String city;
    private String stateProvince;
    private String postalCode;
    private String country;
    private String countryCode;

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AddressResponse fromEntity(EmployeeAddress entity) {
        if (entity == null) return null;

        return AddressResponse.builder()
                .id(entity.getId())
                .addressType(entity.getAddressType() != null ? entity.getAddressType().name() : null)
                .isPrimary(entity.getIsPrimary())
                .addressLine1(entity.getAddressLine1())
                .addressLine2(entity.getAddressLine2())
                .addressLine3(entity.getAddressLine3())
                .city(entity.getCity())
                .stateProvince(entity.getStateProvince())
                .postalCode(entity.getPostalCode())
                .country(entity.getCountry())
                .countryCode(entity.getCountryCode())
                .effectiveFrom(entity.getEffectiveFrom())
                .effectiveTo(entity.getEffectiveTo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
