package com.hrms.controller.onboarding;

import com.hrms.dto.onboarding.*;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.service.UserService;
import com.hrms.service.onboarding.OnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST API for employee onboarding management
 * Inspired by BambooHR, Gusto, and Rippling onboarding features
 */
@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final UserService userService;

    // ==================== Template Endpoints ====================

    @PostMapping("/templates")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'HR_MANAGER')")
    public ResponseEntity<OnboardingTemplateDto> createTemplate(
            @Valid @RequestBody OnboardingTemplateDto dto,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        OnboardingTemplateDto result = onboardingService.createTemplate(dto, user.getOrganization(), user);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/templates/{id}")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'HR_MANAGER')")
    public ResponseEntity<OnboardingTemplateDto> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody OnboardingTemplateDto dto,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        OnboardingTemplateDto result = onboardingService.updateTemplate(id, dto, user);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/templates/{id}")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'HR_MANAGER')")
    public ResponseEntity<OnboardingTemplateDto> getTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(onboardingService.getTemplate(id));
    }

    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<OnboardingTemplateDto>> getOrganizationTemplates(Authentication authentication) {
        Organization org = getCurrentUser(authentication).getOrganization();
        return ResponseEntity.ok(onboardingService.getOrganizationTemplates(org));
    }

    // ==================== Employee Onboarding Endpoints ====================

    @PostMapping("/start/{employeeId}")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'HR_MANAGER')")
    public ResponseEntity<OnboardingProgressDto> startOnboarding(
            @PathVariable UUID employeeId,
            @RequestParam(required = false) UUID templateId,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        OnboardingProgressDto result = onboardingService.startOnboarding(employeeId, templateId, user);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/progress/{progressId}/steps/{stepId}")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'HR_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<OnboardingProgressDto> updateStepStatus(
            @PathVariable UUID progressId,
            @PathVariable UUID stepId,
            @RequestParam String action,
            @RequestParam(required = false) String notes,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        OnboardingProgressDto result = onboardingService.updateStepStatus(progressId, stepId, action, notes, user);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'HR_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<?> getEmployeeOnboarding(
            @PathVariable UUID employeeId,
            Authentication authentication) {
        OnboardingProgressDto progress = onboardingService.getEmployeeOnboarding(employeeId);
        if (progress == null) {
            return ResponseEntity.ok(Map.of("message", "No onboarding found for this employee"));
        }
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/my-onboarding")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getMyOnboarding(Authentication authentication) {
        User user = getCurrentUser(authentication);
        // Need to get employee ID from user
        // This would require additional lookup
        return ResponseEntity.ok(Map.of("message", "Endpoint for employee self-service onboarding view"));
    }

    @GetMapping("/organization")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<OnboardingProgressDto>> getOrganizationOnboarding(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        Organization org = getCurrentUser(authentication).getOrganization();
        return ResponseEntity.ok(onboardingService.getOrganizationOnboarding(org, status));
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'HR_MANAGER')")
    public ResponseEntity<Map<String, Object>> getOnboardingDashboardStats(Authentication authentication) {
        Organization org = getCurrentUser(authentication).getOrganization();
        return ResponseEntity.ok(onboardingService.getOnboardingDashboardStats(org));
    }

    // ==================== Helper Methods ====================

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
