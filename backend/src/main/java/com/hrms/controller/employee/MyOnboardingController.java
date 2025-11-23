package com.hrms.controller.employee;

import com.hrms.dto.employee.request.*;
import com.hrms.dto.employee.response.EmployeeOnboardingResponse;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.entity.employee.IdentityDocumentType;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.EmployeeRepository;
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
 * REST Controller for Self-Service Employee Onboarding
 * Allows employees to manage their own onboarding data
 */
@RestController
@RequestMapping("/api/my/onboarding")
public class MyOnboardingController {

    private static final Logger logger = LoggerFactory.getLogger(MyOnboardingController.class);

    private final EmployeeOnboardingService onboardingService;
    private final EmployeeRepository employeeRepository;

    public MyOnboardingController(
            EmployeeOnboardingService onboardingService,
            EmployeeRepository employeeRepository
    ) {
        this.onboardingService = onboardingService;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Get my onboarding status and progress
     */
    @GetMapping
    public ResponseEntity<EmployeeOnboardingResponse> getMyOnboardingStatus(
            @AuthenticationPrincipal User currentUser
    ) {
        logger.debug("Getting onboarding status for user: {}", currentUser.getId());
        EmployeeOnboardingResponse response = onboardingService.getMyOnboardingStatus(currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Get required document types for my work country
     */
    @GetMapping("/required-documents")
    public ResponseEntity<List<IdentityDocumentType>> getMyRequiredDocuments(
            @AuthenticationPrincipal User currentUser
    ) {
        UUID employeeId = getEmployeeId(currentUser);
        List<IdentityDocumentType> documentTypes = onboardingService.getRequiredDocumentTypes(employeeId);
        return ResponseEntity.ok(documentTypes);
    }

    /**
     * Update my basic information
     */
    @PutMapping("/basic-info")
    public ResponseEntity<EmployeeOnboardingResponse> updateMyBasicInfo(
            @Valid @RequestBody CreateEmployeeOnboardingRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        UUID employeeId = getEmployeeId(currentUser);
        logger.info("User {} updating their basic info", currentUser.getId());
        EmployeeOnboardingResponse response = onboardingService.updateBasicInfo(employeeId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Add my address
     */
    @PostMapping("/address")
    public ResponseEntity<EmployeeOnboardingResponse> addMyAddress(
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        UUID employeeId = getEmployeeId(currentUser);
        logger.info("User {} adding their address", currentUser.getId());
        EmployeeOnboardingResponse response = onboardingService.addAddress(employeeId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Add my emergency contact
     */
    @PostMapping("/emergency-contact")
    public ResponseEntity<EmployeeOnboardingResponse> addMyEmergencyContact(
            @Valid @RequestBody EmergencyContactRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        UUID employeeId = getEmployeeId(currentUser);
        logger.info("User {} adding their emergency contact", currentUser.getId());
        EmployeeOnboardingResponse response = onboardingService.addEmergencyContact(employeeId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Add my identity document
     */
    @PostMapping("/identity-document")
    public ResponseEntity<EmployeeOnboardingResponse> addMyIdentityDocument(
            @Valid @RequestBody IdentityDocumentRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        UUID employeeId = getEmployeeId(currentUser);
        logger.info("User {} adding their identity document", currentUser.getId());
        EmployeeOnboardingResponse response = onboardingService.addIdentityDocument(employeeId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Add my bank account
     */
    @PostMapping("/bank-account")
    public ResponseEntity<EmployeeOnboardingResponse> addMyBankAccount(
            @Valid @RequestBody BankAccountRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        UUID employeeId = getEmployeeId(currentUser);
        logger.info("User {} adding their bank account", currentUser.getId());
        EmployeeOnboardingResponse response = onboardingService.addBankAccount(employeeId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Submit my onboarding for review
     */
    @PostMapping("/submit")
    public ResponseEntity<EmployeeOnboardingResponse> submitMyOnboarding(
            @AuthenticationPrincipal User currentUser
    ) {
        UUID employeeId = getEmployeeId(currentUser);
        logger.info("User {} submitting their onboarding", currentUser.getId());
        // For self-service, we don't mark as complete - just return status
        // Admin will complete after review
        EmployeeOnboardingResponse response = onboardingService.getOnboardingStatus(employeeId);
        return ResponseEntity.ok(response);
    }

    private UUID getEmployeeId(User user) {
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> ResourceNotFoundException.employee(user.getId()));
        return employee.getId();
    }
}
