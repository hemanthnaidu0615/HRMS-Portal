package com.hrms.dto.employee.response;

import com.hrms.entity.employee.EmployeeBankAccount;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankAccountResponse {

    private UUID id;

    private String accountPurpose;
    private Boolean isPrimary;
    private Integer priority;

    // Bank Details
    private String bankName;
    private String bankBranch;
    private String accountHolderName;
    private String accountNumberMasked;
    private String accountType;

    // Country & Currency
    private String bankCountry;
    private String bankCountryCode;
    private String currency;

    // Routing Code (country-appropriate)
    private String routingCode;

    // Salary Split
    private String splitType;
    private BigDecimal splitValue;

    // Verification
    private String verificationStatus;
    private LocalDateTime verifiedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BankAccountResponse fromEntity(EmployeeBankAccount entity) {
        if (entity == null) return null;

        return BankAccountResponse.builder()
                .id(entity.getId())
                .accountPurpose(entity.getAccountPurpose() != null ? entity.getAccountPurpose().name() : null)
                .isPrimary(entity.getIsPrimary())
                .priority(entity.getPriority())
                .bankName(entity.getBankName())
                .bankBranch(entity.getBankBranch())
                .accountHolderName(entity.getAccountHolderName())
                .accountNumberMasked(entity.getAccountNumberMasked())
                .accountType(entity.getAccountType() != null ? entity.getAccountType().name() : null)
                .bankCountry(entity.getBankCountry())
                .bankCountryCode(entity.getBankCountryCode())
                .currency(entity.getCurrency())
                .routingCode(entity.getRoutingCode())
                .splitType(entity.getSplitType() != null ? entity.getSplitType().name() : null)
                .splitValue(entity.getSplitValue())
                .verificationStatus(entity.getVerificationStatus() != null ? entity.getVerificationStatus().name() : null)
                .verifiedAt(entity.getVerifiedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
