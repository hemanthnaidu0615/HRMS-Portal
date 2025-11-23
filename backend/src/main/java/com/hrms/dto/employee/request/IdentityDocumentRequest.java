package com.hrms.dto.employee.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Request DTO for employee identity document
 * Country-agnostic: works with any document type from any country
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityDocumentRequest {

    @NotNull(message = "Document type is required")
    private UUID documentTypeId;

    @NotBlank(message = "Document number is required")
    @Size(max = 100, message = "Document number must not exceed 100 characters")
    private String documentNumber;

    @Size(max = 255, message = "Issuing authority must not exceed 255 characters")
    private String issuingAuthority;

    @Size(max = 100, message = "Issuing country must not exceed 100 characters")
    private String issuingCountry;

    @Size(max = 100, message = "Issuing state must not exceed 100 characters")
    private String issuingState;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    private Boolean isPrimaryTaxId = false;

    private Boolean isWorkAuthorization = false;

    private Boolean usedForI9 = false;

    // Document proof URLs (if uploaded separately)
    @Size(max = 500, message = "Document front URL must not exceed 500 characters")
    private String documentFrontUrl;

    @Size(max = 500, message = "Document back URL must not exceed 500 characters")
    private String documentBackUrl;

    // Custom validation
    public boolean isValid() {
        // Expiry date should be after issue date
        if (issueDate != null && expiryDate != null && expiryDate.isBefore(issueDate)) {
            return false;
        }
        return true;
    }
}
