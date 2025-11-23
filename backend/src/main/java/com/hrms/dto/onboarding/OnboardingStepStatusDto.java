package com.hrms.dto.onboarding;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class OnboardingStepStatusDto {

    private UUID id;
    private UUID stepId;
    private String stepCode;
    private String stepName;
    private String stepDescription;
    private String category;
    private String stepType;
    private String assignedTo;

    private String status;
    private Integer percentage;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDate dueDate;
    private Boolean isOverdue;

    private String completedByName;
    private String completionNotes;

    private String blockedReason;
    private String blockedByStepName;

    private String icon;
    private String color;
    private Boolean canBeSkipped;
    private Boolean requiresApproval;
}
