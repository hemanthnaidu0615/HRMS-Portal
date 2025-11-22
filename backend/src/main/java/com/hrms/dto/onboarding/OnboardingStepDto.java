package com.hrms.dto.onboarding;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class OnboardingStepDto {

    private UUID id;

    @NotNull(message = "Step number is required")
    private Integer stepNumber;

    @NotBlank(message = "Step code is required")
    private String stepCode;

    @NotBlank(message = "Step name is required")
    private String stepName;

    private String stepDescription;

    @NotBlank(message = "Category is required")
    private String category;

    private String stepType = "task";
    private UUID dependsOnStepId;
    private Integer dueByDays;
    private Integer reminderBeforeDays;
    private Integer escalationAfterDays;
    private String assignedTo = "employee";
    private String assignedRole;
    private Boolean canBeSkipped = false;
    private Boolean requiresApproval = false;
    private Boolean autoCompleteOnData = false;
    private String relatedTable;
    private String relatedField;
    private String icon;
    private String color;
    private String helpUrl;
    private Boolean isActive = true;

    private List<OnboardingChecklistItemDto> checklistItems;
}
