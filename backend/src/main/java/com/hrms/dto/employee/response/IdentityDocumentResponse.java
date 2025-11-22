package com.hrms.dto.employee.response;

import com.hrms.entity.employee.EmployeeIdentityDocument;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityDocumentResponse {

    private UUID id;

    // Document Type Info
    private UUID documentTypeId;
    private String documentCode;
    private String documentName;
    private String category;
    private String countryCode;

    // Document Details (masked for security)
    private String documentNumberMasked;
    private String issuingAuthority;
    private String issuingCountry;
    private LocalDate issueDate;
    private LocalDate expiryDate;

    // Status
    private String verificationStatus;
    private LocalDateTime verifiedAt;
    private Boolean isExpired;
    private Boolean isExpiringSoon;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static IdentityDocumentResponse fromEntity(EmployeeIdentityDocument entity) {
        if (entity == null) return null;

        IdentityDocumentResponse.IdentityDocumentResponseBuilder builder = IdentityDocumentResponse.builder()
                .id(entity.getId())
                .documentNumberMasked(entity.getDocumentNumberMasked())
                .issuingAuthority(entity.getIssuingAuthority())
                .issuingCountry(entity.getIssuingCountry())
                .issueDate(entity.getIssueDate())
                .expiryDate(entity.getExpiryDate())
                .verificationStatus(entity.getVerificationStatus() != null ? entity.getVerificationStatus().name() : null)
                .verifiedAt(entity.getVerifiedAt())
                .isExpired(entity.isExpired())
                .isExpiringSoon(entity.isExpiringSoon())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt());

        if (entity.getDocumentType() != null) {
            builder.documentTypeId(entity.getDocumentType().getId())
                   .documentCode(entity.getDocumentType().getDocumentCode())
                   .documentName(entity.getDocumentType().getDisplayName())
                   .category(entity.getDocumentType().getCategory() != null ? entity.getDocumentType().getCategory().name() : null)
                   .countryCode(entity.getDocumentType().getCountryCode());
        }

        return builder.build();
    }

    /**
     * Version with full document number (for authorized users only)
     */
    public static IdentityDocumentResponse fromEntityWithFullNumber(EmployeeIdentityDocument entity) {
        IdentityDocumentResponse response = fromEntity(entity);
        if (response != null && entity != null) {
            response.setDocumentNumberMasked(entity.getDocumentNumber()); // Full number
        }
        return response;
    }
}
