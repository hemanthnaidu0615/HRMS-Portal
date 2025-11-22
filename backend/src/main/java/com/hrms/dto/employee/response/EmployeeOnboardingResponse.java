package com.hrms.dto.employee.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for employee onboarding status and progress
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeOnboardingResponse {

    private UUID employeeId;
    private String employeeCode;

    // Basic Info
    private String firstName;
    private String middleName;
    private String lastName;
    private String preferredName;
    private String email;
    private String workEmail;

    // Employment
    private String employmentType;
    private String employmentStatus;
    private LocalDate joiningDate;
    private String departmentName;
    private String positionTitle;

    // Onboarding Progress
    private OnboardingProgress progress;

    // Related data
    private List<AddressResponse> addresses;
    private List<EmergencyContactResponse> emergencyContacts;
    private List<IdentityDocumentResponse> identityDocuments;
    private List<BankAccountResponse> bankAccounts;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OnboardingProgress {
        private Integer completionPercentage;
        private String currentStep;
        private List<StepStatus> steps;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class StepStatus {
            private String stepName;
            private String displayName;
            private Boolean isCompleted;
            private Boolean isRequired;
            private Integer stepOrder;
        }
    }

    /**
     * Calculate onboarding completion percentage based on filled data
     */
    public static OnboardingProgress calculateProgress(
            boolean hasBasicInfo,
            boolean hasAddress,
            boolean hasEmergencyContact,
            boolean hasIdentityDocument,
            boolean hasBankAccount,
            boolean hasTaxInfo
    ) {
        List<OnboardingProgress.StepStatus> steps = List.of(
                OnboardingProgress.StepStatus.builder()
                        .stepName("basic_info")
                        .displayName("Basic Information")
                        .isCompleted(hasBasicInfo)
                        .isRequired(true)
                        .stepOrder(1)
                        .build(),
                OnboardingProgress.StepStatus.builder()
                        .stepName("address")
                        .displayName("Address")
                        .isCompleted(hasAddress)
                        .isRequired(true)
                        .stepOrder(2)
                        .build(),
                OnboardingProgress.StepStatus.builder()
                        .stepName("emergency_contact")
                        .displayName("Emergency Contact")
                        .isCompleted(hasEmergencyContact)
                        .isRequired(true)
                        .stepOrder(3)
                        .build(),
                OnboardingProgress.StepStatus.builder()
                        .stepName("identity_documents")
                        .displayName("Identity Documents")
                        .isCompleted(hasIdentityDocument)
                        .isRequired(true)
                        .stepOrder(4)
                        .build(),
                OnboardingProgress.StepStatus.builder()
                        .stepName("bank_account")
                        .displayName("Bank Account")
                        .isCompleted(hasBankAccount)
                        .isRequired(true)
                        .stepOrder(5)
                        .build(),
                OnboardingProgress.StepStatus.builder()
                        .stepName("tax_info")
                        .displayName("Tax Information")
                        .isCompleted(hasTaxInfo)
                        .isRequired(false)
                        .stepOrder(6)
                        .build()
        );

        long completedRequired = steps.stream()
                .filter(s -> s.getIsRequired() && s.getIsCompleted())
                .count();
        long totalRequired = steps.stream()
                .filter(OnboardingProgress.StepStatus::getIsRequired)
                .count();

        int percentage = totalRequired > 0 ? (int) ((completedRequired * 100) / totalRequired) : 0;

        String currentStep = steps.stream()
                .filter(s -> s.getIsRequired() && !s.getIsCompleted())
                .findFirst()
                .map(OnboardingProgress.StepStatus::getStepName)
                .orElse("completed");

        return OnboardingProgress.builder()
                .completionPercentage(percentage)
                .currentStep(currentStep)
                .steps(steps)
                .build();
    }
}
