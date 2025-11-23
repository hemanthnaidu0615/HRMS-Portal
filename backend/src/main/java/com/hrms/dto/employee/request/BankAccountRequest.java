package com.hrms.dto.employee.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Request DTO for employee bank account
 * Country-agnostic: supports different routing codes for different countries
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankAccountRequest {

    @Pattern(regexp = "^(SALARY|REIMBURSEMENT|BONUS|ALL)$", message = "Invalid account purpose")
    @Builder.Default
    private String accountPurpose = "SALARY";

    @Builder.Default
    private Boolean isPrimary = false;

    @NotBlank(message = "Bank name is required")
    @Size(max = 255, message = "Bank name must not exceed 255 characters")
    private String bankName;

    @Size(max = 255, message = "Bank branch must not exceed 255 characters")
    private String bankBranch;

    @Size(max = 500, message = "Bank address must not exceed 500 characters")
    private String bankAddress;

    @NotBlank(message = "Account holder name is required")
    @Size(max = 255, message = "Account holder name must not exceed 255 characters")
    private String accountHolderName;

    @NotBlank(message = "Account number is required")
    @Size(max = 100, message = "Account number must not exceed 100 characters")
    @Pattern(regexp = "^[A-Za-z0-9\\-]+$", message = "Account number contains invalid characters")
    private String accountNumber;

    @Pattern(regexp = "^(CHECKING|SAVINGS|CURRENT|SALARY)$", message = "Invalid account type")
    @Builder.Default
    private String accountType = "CHECKING";

    // International
    @Size(min = 8, max = 11, message = "SWIFT code must be 8-11 characters")
    @Pattern(regexp = "^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$", message = "Invalid SWIFT code format")
    private String swiftCode;

    @Size(max = 34, message = "IBAN must not exceed 34 characters")
    private String iban;

    // USA
    @Size(min = 9, max = 9, message = "Routing number must be 9 digits")
    @Pattern(regexp = "^\\d{9}$", message = "Routing number must be 9 digits")
    private String routingNumber;

    // India
    @Size(min = 11, max = 11, message = "IFSC code must be 11 characters")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Invalid IFSC code format")
    private String ifscCode;

    // UK
    @Size(min = 6, max = 8, message = "Sort code must be 6-8 characters")
    @Pattern(regexp = "^\\d{2}-?\\d{2}-?\\d{2}$", message = "Invalid sort code format")
    private String sortCode;

    // Australia
    @Size(min = 6, max = 6, message = "BSB code must be 6 digits")
    @Pattern(regexp = "^\\d{6}$", message = "BSB code must be 6 digits")
    private String bsbCode;

    // Canada
    @Size(min = 5, max = 5, message = "Transit number must be 5 digits")
    @Pattern(regexp = "^\\d{5}$", message = "Transit number must be 5 digits")
    private String transitNumber;

    @Size(min = 3, max = 3, message = "Institution number must be 3 digits")
    @Pattern(regexp = "^\\d{3}$", message = "Institution number must be 3 digits")
    private String institutionNumber;

    // Mexico
    @Size(min = 18, max = 18, message = "CLABE must be 18 digits")
    @Pattern(regexp = "^\\d{18}$", message = "CLABE must be 18 digits")
    private String clabe;

    // Country & Currency
    @NotBlank(message = "Bank country is required")
    @Size(max = 100, message = "Bank country must not exceed 100 characters")
    @Builder.Default
    private String bankCountry = "United States";

    @Size(min = 2, max = 3, message = "Country code must be 2-3 characters")
    private String bankCountryCode;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency code must be 3 characters (ISO 4217)")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be 3 uppercase letters")
    @Builder.Default
    private String currency = "USD";

    // Salary Split
    @Pattern(regexp = "^(PERCENTAGE|FIXED_AMOUNT|REMAINDER)$", message = "Invalid split type")
    private String splitType;

    @DecimalMin(value = "0.0", message = "Split value cannot be negative")
    private BigDecimal splitValue;

    // Validation based on country
    public boolean hasRequiredRoutingCode() {
        if (bankCountryCode == null) return swiftCode != null;
        return switch (bankCountryCode) {
            case "USA" -> routingNumber != null;
            case "IND" -> ifscCode != null;
            case "GBR" -> sortCode != null;
            case "AUS" -> bsbCode != null;
            case "CAN" -> transitNumber != null && institutionNumber != null;
            case "MEX" -> clabe != null;
            default -> swiftCode != null || iban != null;
        };
    }
}
