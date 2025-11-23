package com.hrms.dto.onboarding;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class OnboardingTemplateDto {

    private UUID id;

    @NotBlank(message = "Template name is required")
    @Size(max = 255, message = "Template name must not exceed 255 characters")
    private String templateName;

    @NotBlank(message = "Template code is required")
    @Size(max = 50, message = "Template code must not exceed 50 characters")
    private String templateCode;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private String employmentType;
    private UUID departmentId;
    private String countryCode;
    private UUID positionId;

    private Integer targetCompletionDays = 30;
    private Boolean autoAssign = false;
    private Boolean sendWelcomeEmail = true;
    private Boolean allowSelfService = true;
    private Boolean isActive = true;
    private Boolean isDefault = false;

    private List<OnboardingStepDto> steps;
}
