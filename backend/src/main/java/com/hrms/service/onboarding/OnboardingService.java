package com.hrms.service.onboarding;

import com.hrms.dto.onboarding.*;
import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.entity.onboarding.*;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PositionRepository;
import com.hrms.repository.onboarding.EmployeeOnboardingProgressRepository;
import com.hrms.repository.onboarding.OnboardingTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for employee onboarding workflow management
 * Inspired by BambooHR, Gusto, and Rippling onboarding features
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OnboardingService {

    private final OnboardingTemplateRepository templateRepository;
    private final EmployeeOnboardingProgressRepository progressRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;

    // ==================== Template Management ====================

    public OnboardingTemplateDto createTemplate(OnboardingTemplateDto dto, Organization organization, User createdBy) {
        if (templateRepository.existsByOrganizationAndTemplateCode(organization, dto.getTemplateCode())) {
            throw new IllegalArgumentException("Template code already exists: " + dto.getTemplateCode());
        }

        OnboardingTemplate template = new OnboardingTemplate();
        template.setOrganization(organization);
        template.setCreatedBy(createdBy);
        mapDtoToTemplate(dto, template);

        template = templateRepository.save(template);
        log.info("Created onboarding template: {} for org: {}", template.getTemplateCode(), organization.getName());

        return mapTemplateToDto(template);
    }

    public OnboardingTemplateDto updateTemplate(UUID templateId, OnboardingTemplateDto dto, User updatedBy) {
        OnboardingTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));

        template.setUpdatedBy(updatedBy);
        mapDtoToTemplate(dto, template);

        template = templateRepository.save(template);
        log.info("Updated onboarding template: {}", template.getTemplateCode());

        return mapTemplateToDto(template);
    }

    @Transactional(readOnly = true)
    public OnboardingTemplateDto getTemplate(UUID templateId) {
        return templateRepository.findByIdWithSteps(templateId)
                .map(this::mapTemplateToDto)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));
    }

    @Transactional(readOnly = true)
    public List<OnboardingTemplateDto> getOrganizationTemplates(Organization organization) {
        return templateRepository.findByOrganizationAndIsActiveTrue(organization)
                .stream()
                .map(this::mapTemplateToDto)
                .collect(Collectors.toList());
    }

    // ==================== Employee Onboarding ====================

    /**
     * Start onboarding for an employee
     * Auto-selects template based on employee attributes or uses default
     */
    public OnboardingProgressDto startOnboarding(UUID employeeId, UUID templateId, User initiatedBy) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));

        // Check if employee already has active onboarding
        if (progressRepository.existsByEmployeeAndOverallStatusIn(employee,
                Arrays.asList("NOT_STARTED", "IN_PROGRESS"))) {
            throw new IllegalArgumentException("Employee already has active onboarding");
        }

        // Find template
        OnboardingTemplate template;
        if (templateId != null) {
            template = templateRepository.findByIdWithSteps(templateId)
                    .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));
        } else {
            template = findBestMatchingTemplate(employee);
        }

        // Create progress record
        EmployeeOnboardingProgress progress = new EmployeeOnboardingProgress();
        progress.setEmployee(employee);
        progress.setOrganization(employee.getOrganization());
        progress.setTemplate(template);
        progress.setOverallStatus("NOT_STARTED");
        progress.setStartedAt(LocalDateTime.now());

        // Calculate target completion date
        if (template.getTargetCompletionDays() != null) {
            progress.setTargetCompletionDate(LocalDate.now().plusDays(template.getTargetCompletionDays()));
        }

        // Set manager
        if (employee.getReportsTo() != null) {
            progress.setManager(employee.getReportsTo());
        }

        // Create step statuses
        createStepStatuses(progress, template);

        progress = progressRepository.save(progress);

        // Update employee onboarding status
        employee.setOnboardingStatus("in_progress");
        employeeRepository.save(employee);

        log.info("Started onboarding for employee: {} with template: {}",
                employee.getWorkEmail(), template.getTemplateCode());

        return mapProgressToDto(progress);
    }

    /**
     * Update step status (complete, skip, etc.)
     */
    public OnboardingProgressDto updateStepStatus(UUID progressId, UUID stepId, String action,
                                                   String notes, User updatedBy) {
        EmployeeOnboardingProgress progress = progressRepository.findByIdWithStepStatuses(progressId)
                .orElseThrow(() -> new IllegalArgumentException("Onboarding progress not found"));

        EmployeeOnboardingStepStatus stepStatus = progress.getStepStatuses().stream()
                .filter(s -> s.getStep().getId().equals(stepId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Step not found in this onboarding"));

        switch (action.toUpperCase()) {
            case "COMPLETE" -> {
                stepStatus.markCompleted(updatedBy);
                stepStatus.setCompletionNotes(notes);
            }
            case "START" -> stepStatus.markInProgress();
            case "SKIP" -> {
                if (!stepStatus.getStep().getCanBeSkipped()) {
                    throw new IllegalArgumentException("This step cannot be skipped");
                }
                stepStatus.setStatus("SKIPPED");
                stepStatus.setCompletionNotes(notes);
            }
            case "BLOCK" -> {
                stepStatus.setStatus("BLOCKED");
                stepStatus.setBlockedReason(notes);
            }
            default -> throw new IllegalArgumentException("Unknown action: " + action);
        }

        // Update progress metrics
        progress.updateMetrics();

        // Check if all steps are complete
        if (progress.getCompletedSteps() + progress.getSkippedSteps() == progress.getTotalSteps()) {
            completeOnboarding(progress, updatedBy);
        } else if ("NOT_STARTED".equals(progress.getOverallStatus())) {
            progress.setOverallStatus("IN_PROGRESS");
        }

        progress = progressRepository.save(progress);

        return mapProgressToDto(progress);
    }

    /**
     * Get employee's onboarding progress
     */
    @Transactional(readOnly = true)
    public OnboardingProgressDto getEmployeeOnboarding(UUID employeeId) {
        return progressRepository.findByEmployeeIdWithStepStatuses(employeeId)
                .map(this::mapProgressToDto)
                .orElse(null);
    }

    /**
     * Get all onboarding progress for an organization
     */
    @Transactional(readOnly = true)
    public List<OnboardingProgressDto> getOrganizationOnboarding(Organization organization, String statusFilter) {
        List<EmployeeOnboardingProgress> progressList;

        if (statusFilter != null && !statusFilter.isEmpty()) {
            progressList = progressRepository.findByOrganizationAndOverallStatus(organization, statusFilter);
        } else {
            progressList = progressRepository.findActiveOnboarding(organization);
        }

        return progressList.stream()
                .map(this::mapProgressToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get onboarding dashboard stats
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getOnboardingDashboardStats(Organization organization) {
        Map<String, Object> stats = new HashMap<>();

        long activeCount = progressRepository.countActiveOnboarding(organization);
        Double avgProgress = progressRepository.getAverageProgressPercentage(organization);
        List<EmployeeOnboardingProgress> overdueList = progressRepository.findWithOverdueSteps(organization);

        stats.put("activeOnboarding", activeCount);
        stats.put("averageProgress", avgProgress != null ? Math.round(avgProgress) : 0);
        stats.put("withOverdueSteps", overdueList.size());

        // Get recent completions (last 30 days)
        stats.put("recentCompletions", progressRepository.findByOrganizationAndOverallStatus(organization, "COMPLETED")
                .stream()
                .filter(p -> p.getCompletedAt() != null &&
                        p.getCompletedAt().isAfter(LocalDateTime.now().minusDays(30)))
                .count());

        return stats;
    }

    // ==================== Helper Methods ====================

    private OnboardingTemplate findBestMatchingTemplate(Employee employee) {
        Organization org = employee.getOrganization();
        String employmentType = employee.getEmploymentType();
        UUID departmentId = employee.getDepartment() != null ? employee.getDepartment().getId() : null;
        String countryCode = org.getCountryCode();

        List<OnboardingTemplate> matches = templateRepository.findMatchingTemplates(
                org, employmentType, departmentId, countryCode);

        if (!matches.isEmpty()) {
            return matches.get(0);
        }

        return templateRepository.findByOrganizationAndIsDefaultTrue(org)
                .orElseThrow(() -> new IllegalArgumentException("No suitable onboarding template found"));
    }

    private void createStepStatuses(EmployeeOnboardingProgress progress, OnboardingTemplate template) {
        List<EmployeeOnboardingStepStatus> statuses = new ArrayList<>();

        for (OnboardingTemplateStep step : template.getSteps()) {
            if (!step.getIsActive()) continue;

            EmployeeOnboardingStepStatus status = new EmployeeOnboardingStepStatus();
            status.setOnboardingProgress(progress);
            status.setStep(step);
            status.setStatus("PENDING");
            status.setPercentage(0);

            // Calculate due date
            if (step.getDueByDays() != null) {
                status.setDueDate(LocalDate.now().plusDays(step.getDueByDays()));
            }

            // Check dependencies
            if (step.getDependsOnStep() != null) {
                status.setStatus("BLOCKED");
                status.setBlockedByStep(step.getDependsOnStep());
                status.setBlockedReason("Waiting for: " + step.getDependsOnStep().getStepName());
            }

            statuses.add(status);
        }

        progress.setStepStatuses(statuses);
        progress.setTotalSteps(statuses.size());
        progress.setPendingSteps(statuses.size());
    }

    private void completeOnboarding(EmployeeOnboardingProgress progress, User completedBy) {
        progress.setOverallStatus("COMPLETED");
        progress.setCompletedAt(LocalDateTime.now());
        progress.setOverallPercentage(100);

        // Update employee
        Employee employee = progress.getEmployee();
        employee.setOnboardingStatus("completed");
        employee.setOnboardingCompletedAt(LocalDateTime.now());
        employee.setOnboardingCompletedBy(completedBy);
        employeeRepository.save(employee);

        log.info("Completed onboarding for employee: {}", employee.getWorkEmail());
    }

    // ==================== Mapping Methods ====================

    private void mapDtoToTemplate(OnboardingTemplateDto dto, OnboardingTemplate template) {
        template.setTemplateName(dto.getTemplateName());
        template.setTemplateCode(dto.getTemplateCode());
        template.setDescription(dto.getDescription());
        template.setEmploymentType(dto.getEmploymentType());
        template.setCountryCode(dto.getCountryCode());
        template.setTargetCompletionDays(dto.getTargetCompletionDays());
        template.setAutoAssign(dto.getAutoAssign());
        template.setSendWelcomeEmail(dto.getSendWelcomeEmail());
        template.setAllowSelfService(dto.getAllowSelfService());
        template.setIsActive(dto.getIsActive());
        template.setIsDefault(dto.getIsDefault());

        if (dto.getDepartmentId() != null) {
            template.setDepartment(departmentRepository.findById(dto.getDepartmentId()).orElse(null));
        }
        if (dto.getPositionId() != null) {
            template.setPosition(positionRepository.findById(dto.getPositionId()).orElse(null));
        }

        // Map steps if provided
        if (dto.getSteps() != null) {
            template.getSteps().clear();
            for (OnboardingStepDto stepDto : dto.getSteps()) {
                OnboardingTemplateStep step = new OnboardingTemplateStep();
                step.setTemplate(template);
                mapStepDtoToEntity(stepDto, step);
                template.getSteps().add(step);
            }
        }
    }

    private void mapStepDtoToEntity(OnboardingStepDto dto, OnboardingTemplateStep step) {
        step.setStepNumber(dto.getStepNumber());
        step.setStepCode(dto.getStepCode());
        step.setStepName(dto.getStepName());
        step.setStepDescription(dto.getStepDescription());
        step.setCategory(dto.getCategory());
        step.setStepType(dto.getStepType());
        step.setDueByDays(dto.getDueByDays());
        step.setReminderBeforeDays(dto.getReminderBeforeDays());
        step.setEscalationAfterDays(dto.getEscalationAfterDays());
        step.setAssignedTo(dto.getAssignedTo());
        step.setAssignedRole(dto.getAssignedRole());
        step.setCanBeSkipped(dto.getCanBeSkipped());
        step.setRequiresApproval(dto.getRequiresApproval());
        step.setAutoCompleteOnData(dto.getAutoCompleteOnData());
        step.setRelatedTable(dto.getRelatedTable());
        step.setRelatedField(dto.getRelatedField());
        step.setIcon(dto.getIcon());
        step.setColor(dto.getColor());
        step.setHelpUrl(dto.getHelpUrl());
        step.setIsActive(dto.getIsActive());

        if (dto.getChecklistItems() != null) {
            step.getChecklistItems().clear();
            for (OnboardingChecklistItemDto itemDto : dto.getChecklistItems()) {
                OnboardingChecklistItem item = new OnboardingChecklistItem();
                item.setStep(step);
                mapItemDtoToEntity(itemDto, item);
                step.getChecklistItems().add(item);
            }
        }
    }

    private void mapItemDtoToEntity(OnboardingChecklistItemDto dto, OnboardingChecklistItem item) {
        item.setItemOrder(dto.getItemOrder());
        item.setItemName(dto.getItemName());
        item.setItemDescription(dto.getItemDescription());
        item.setItemType(dto.getItemType());
        item.setRelatedField(dto.getRelatedField());
        item.setRelatedTable(dto.getRelatedTable());
        item.setRequiredDocumentType(dto.getRequiredDocumentType());
        item.setAcknowledgementText(dto.getAcknowledgementText());
        item.setRequiresSignature(dto.getRequiresSignature());
        item.setIsRequired(dto.getIsRequired());
        item.setValidationRule(dto.getValidationRule());
        item.setMinValue(dto.getMinValue());
        item.setMaxValue(dto.getMaxValue());
        item.setRegexPattern(dto.getRegexPattern());
        item.setHelpText(dto.getHelpText());
        item.setExampleText(dto.getExampleText());
        item.setHelpUrl(dto.getHelpUrl());
    }

    private OnboardingTemplateDto mapTemplateToDto(OnboardingTemplate template) {
        OnboardingTemplateDto dto = new OnboardingTemplateDto();
        dto.setId(template.getId());
        dto.setTemplateName(template.getTemplateName());
        dto.setTemplateCode(template.getTemplateCode());
        dto.setDescription(template.getDescription());
        dto.setEmploymentType(template.getEmploymentType());
        dto.setCountryCode(template.getCountryCode());
        dto.setTargetCompletionDays(template.getTargetCompletionDays());
        dto.setAutoAssign(template.getAutoAssign());
        dto.setSendWelcomeEmail(template.getSendWelcomeEmail());
        dto.setAllowSelfService(template.getAllowSelfService());
        dto.setIsActive(template.getIsActive());
        dto.setIsDefault(template.getIsDefault());

        if (template.getDepartment() != null) {
            dto.setDepartmentId(template.getDepartment().getId());
        }
        if (template.getPosition() != null) {
            dto.setPositionId(template.getPosition().getId());
        }

        if (template.getSteps() != null) {
            dto.setSteps(template.getSteps().stream()
                    .map(this::mapStepToDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private OnboardingStepDto mapStepToDto(OnboardingTemplateStep step) {
        OnboardingStepDto dto = new OnboardingStepDto();
        dto.setId(step.getId());
        dto.setStepNumber(step.getStepNumber());
        dto.setStepCode(step.getStepCode());
        dto.setStepName(step.getStepName());
        dto.setStepDescription(step.getStepDescription());
        dto.setCategory(step.getCategory());
        dto.setStepType(step.getStepType());
        dto.setDueByDays(step.getDueByDays());
        dto.setReminderBeforeDays(step.getReminderBeforeDays());
        dto.setEscalationAfterDays(step.getEscalationAfterDays());
        dto.setAssignedTo(step.getAssignedTo());
        dto.setAssignedRole(step.getAssignedRole());
        dto.setCanBeSkipped(step.getCanBeSkipped());
        dto.setRequiresApproval(step.getRequiresApproval());
        dto.setAutoCompleteOnData(step.getAutoCompleteOnData());
        dto.setRelatedTable(step.getRelatedTable());
        dto.setRelatedField(step.getRelatedField());
        dto.setIcon(step.getIcon());
        dto.setColor(step.getColor());
        dto.setHelpUrl(step.getHelpUrl());
        dto.setIsActive(step.getIsActive());

        if (step.getDependsOnStep() != null) {
            dto.setDependsOnStepId(step.getDependsOnStep().getId());
        }

        return dto;
    }

    private OnboardingProgressDto mapProgressToDto(EmployeeOnboardingProgress progress) {
        OnboardingProgressDto dto = new OnboardingProgressDto();
        dto.setId(progress.getId());
        dto.setEmployeeId(progress.getEmployee().getId());
        dto.setEmployeeName(progress.getEmployee().getFirstName() + " " + progress.getEmployee().getLastName());
        dto.setEmployeeEmail(progress.getEmployee().getWorkEmail());
        dto.setTemplateId(progress.getTemplate().getId());
        dto.setTemplateName(progress.getTemplate().getTemplateName());
        dto.setOverallStatus(progress.getOverallStatus());
        dto.setOverallPercentage(progress.getOverallPercentage());
        dto.setStartedAt(progress.getStartedAt());
        dto.setTargetCompletionDate(progress.getTargetCompletionDate());
        dto.setCompletedAt(progress.getCompletedAt());
        dto.setTotalSteps(progress.getTotalSteps());
        dto.setCompletedSteps(progress.getCompletedSteps());
        dto.setPendingSteps(progress.getPendingSteps());
        dto.setOverdueSteps(progress.getOverdueSteps());
        dto.setSkippedSteps(progress.getSkippedSteps());

        if (progress.getHrAssignee() != null) {
            dto.setHrAssigneeName(progress.getHrAssignee().getFirstName() + " " + progress.getHrAssignee().getLastName());
        }
        if (progress.getBuddy() != null) {
            dto.setBuddyName(progress.getBuddy().getFirstName() + " " + progress.getBuddy().getLastName());
        }
        if (progress.getManager() != null) {
            dto.setManagerName(progress.getManager().getFirstName() + " " + progress.getManager().getLastName());
        }

        // Calculate days remaining
        if (progress.getTargetCompletionDate() != null && !"COMPLETED".equals(progress.getOverallStatus())) {
            dto.setDaysRemaining((int) ChronoUnit.DAYS.between(LocalDate.now(), progress.getTargetCompletionDate()));
            dto.setIsOnTrack(dto.getDaysRemaining() >= 0 && progress.getOverdueSteps() == 0);
        }

        // Map step statuses
        if (progress.getStepStatuses() != null) {
            dto.setStepStatuses(progress.getStepStatuses().stream()
                    .map(this::mapStepStatusToDto)
                    .collect(Collectors.toList()));

            // Find next action
            progress.getStepStatuses().stream()
                    .filter(s -> "PENDING".equals(s.getStatus()) || "IN_PROGRESS".equals(s.getStatus()))
                    .findFirst()
                    .ifPresent(s -> dto.setNextActionRequired(s.getStep().getStepName()));
        }

        return dto;
    }

    private OnboardingStepStatusDto mapStepStatusToDto(EmployeeOnboardingStepStatus status) {
        OnboardingStepStatusDto dto = new OnboardingStepStatusDto();
        dto.setId(status.getId());
        dto.setStepId(status.getStep().getId());
        dto.setStepCode(status.getStep().getStepCode());
        dto.setStepName(status.getStep().getStepName());
        dto.setStepDescription(status.getStep().getStepDescription());
        dto.setCategory(status.getStep().getCategory());
        dto.setStepType(status.getStep().getStepType());
        dto.setAssignedTo(status.getStep().getAssignedTo());
        dto.setStatus(status.getStatus());
        dto.setPercentage(status.getPercentage());
        dto.setStartedAt(status.getStartedAt());
        dto.setCompletedAt(status.getCompletedAt());
        dto.setDueDate(status.getDueDate());
        dto.setIsOverdue(status.getIsOverdue());
        dto.setCompletionNotes(status.getCompletionNotes());
        dto.setBlockedReason(status.getBlockedReason());
        dto.setIcon(status.getStep().getIcon());
        dto.setColor(status.getStep().getColor());
        dto.setCanBeSkipped(status.getStep().getCanBeSkipped());
        dto.setRequiresApproval(status.getStep().getRequiresApproval());

        if (status.getCompletedBy() != null) {
            dto.setCompletedByName(status.getCompletedBy().getEmail());
        }
        if (status.getBlockedByStep() != null) {
            dto.setBlockedByStepName(status.getBlockedByStep().getStepName());
        }

        return dto;
    }
}
