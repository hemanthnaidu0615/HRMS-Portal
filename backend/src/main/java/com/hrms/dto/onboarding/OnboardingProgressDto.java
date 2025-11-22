package com.hrms.dto.onboarding;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class OnboardingProgressDto {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeEmail;
    private UUID templateId;
    private String templateName;

    private String overallStatus;
    private Integer overallPercentage;

    private LocalDateTime startedAt;
    private LocalDate targetCompletionDate;
    private LocalDateTime completedAt;

    private Integer totalSteps;
    private Integer completedSteps;
    private Integer pendingSteps;
    private Integer overdueSteps;
    private Integer skippedSteps;

    private String hrAssigneeName;
    private String buddyName;
    private String managerName;

    private List<OnboardingStepStatusDto> stepStatuses;

    // For dashboard summaries
    private Integer daysRemaining;
    private Boolean isOnTrack;
    private String nextActionRequired;
}
