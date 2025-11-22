package com.hrms.controller.employee;

import com.hrms.dto.employee.request.*;
import com.hrms.dto.employee.response.EmployeeOnboardingResponse;
import com.hrms.entity.User;
import com.hrms.entity.employee.IdentityDocumentType;
import com.hrms.service.employee.EmployeeOnboardingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Employee Onboarding
 * Provides endpoints for the complete onboarding flow
 */
@RestController
@RequestMapping("/api/employees/{employeeId}/onboarding")
public class EmployeeOnboardingController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeOnboardingController.class);

    private final EmployeeOnboardingService onboardingService;

    public EmployeeOnboardingController(EmployeeOnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    /**
     * Get onboarding status and progress for an employee
     */
    @GetMapping
    public ResponseEntity<EmployeeOnboardingResponse> getOnboardingStatus(
            @PathVariable UUID employeeId
    ) {
        logger.debug("Getting onboarding status for employee: {}", employeeId);
        EmployeeOnboardingResponse response = onboardingService.getOnboardingStatus(employeeId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get required document types for the employee's work country
     */
    @GetMapping("/required-documents")
    public ResponseEntity<List<IdentityDocumentType>> getRequiredDocuments(
            @PathVariable UUID employeeId
    ) {
        List<IdentityDocumentType> documentTypes = onboardingService.getRequiredDocumentTypes(employeeId);
        return ResponseEntity.ok(documentTypes);
    }

    /**
     * Get available document types for a specific country
     */
    @GetMapping("/document-types")
    public ResponseEntity<List<IdentityDocumentType>> getAvailableDocumentTypes(
            @RequestParam(defaultValue = "USA") String countryCode
    ) {
        List<IdentityDocumentType> documentTypes = onboardingService.getAvailableDocumentTypes(countryCode);
        return ResponseEntity.ok(documentTypes);
    }

    /**
     * Step 1: Update basic information
     */
    @PutMapping("/basic-info")
    public ResponseEntity<EmployeeOnboardingResponse> updateBasicInfo(
            @PathVariable UUID employeeId,
            @Valid @RequestBody CreateEmployeeOnboardingRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Updating basic info for employee: {}", employeeId);
        EmployeeOnboardingResponse response = onboardingService.updateBasicInfo(employeeId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Step 2: Add address
     */
    @PostMapping("/address")
    public ResponseEntity<EmployeeOnboardingResponse> addAddress(
            @PathVariable UUID employeeId,
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Adding address for employee: {}", employeeId);
        EmployeeOnboardingResponse response = onboardingService.addAddress(employeeId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Step 3: Add emergency contact
     */
    @PostMapping("/emergency-contact")
    public ResponseEntity<EmployeeOnboardingResponse> addEmergencyContact(
            @PathVariable UUID employeeId,
            @Valid @RequestBody EmergencyContactRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Adding emergency contact for employee: {}", employeeId);
        EmployeeOnboardingResponse response = onboardingService.addEmergencyContact(employeeId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Step 4: Add identity document
     */
    @PostMapping("/identity-document")
    public ResponseEntity<EmployeeOnboardingResponse> addIdentityDocument(
            @PathVariable UUID employeeId,
            @Valid @RequestBody IdentityDocumentRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Adding identity document for employee: {}", employeeId);
        EmployeeOnboardingResponse response = onboardingService.addIdentityDocument(employeeId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Step 5: Add bank account
     */
    @PostMapping("/bank-account")
    public ResponseEntity<EmployeeOnboardingResponse> addBankAccount(
            @PathVariable UUID employeeId,
            @Valid @RequestBody BankAccountRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Adding bank account for employee: {}", employeeId);
        EmployeeOnboardingResponse response = onboardingService.addBankAccount(employeeId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Complete onboarding - marks employee as fully onboarded
     */
    @PostMapping("/complete")
    public ResponseEntity<EmployeeOnboardingResponse> completeOnboarding(
            @PathVariable UUID employeeId,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Completing onboarding for employee: {}", employeeId);
        EmployeeOnboardingResponse response = onboardingService.completeOnboarding(employeeId, currentUser);
        return ResponseEntity.ok(response);
    }
}
