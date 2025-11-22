package com.hrms.controller;

import com.hrms.dto.employee.EmployeeTaxInfoRequest;
import com.hrms.dto.employee.EmployeeTaxInfoResponse;
import com.hrms.service.EmployeeTaxInfoService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for Employee Tax Information
 * Provides endpoints for managing tax data across multiple countries
 */
@RestController
@RequestMapping("/api")
public class EmployeeTaxInfoController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeTaxInfoController.class);

    private final EmployeeTaxInfoService taxInfoService;

    public EmployeeTaxInfoController(EmployeeTaxInfoService taxInfoService) {
        this.taxInfoService = taxInfoService;
    }

    // ==================== Employee Self-Service Endpoints ====================

    /**
     * Get own tax information (for logged-in employee)
     */
    @GetMapping("/employees/{employeeId}/tax-info")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<EmployeeTaxInfoResponse>> getEmployeeTaxInfo(
            @PathVariable UUID employeeId) {

        List<EmployeeTaxInfoResponse> taxInfo = taxInfoService.getEmployeeTaxInfo(employeeId);
        return ResponseEntity.ok(taxInfo);
    }

    /**
     * Get current tax info for specific country
     */
    @GetMapping("/employees/{employeeId}/tax-info/current")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> getCurrentTaxInfo(
            @PathVariable UUID employeeId,
            @RequestParam String countryCode) {

        return taxInfoService.getCurrentTaxInfo(employeeId, countryCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create or update tax information
     */
    @PostMapping("/employees/{employeeId}/tax-info")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<EmployeeTaxInfoResponse> createOrUpdateTaxInfo(
            @PathVariable UUID employeeId,
            @Valid @RequestBody EmployeeTaxInfoRequest request) {

        EmployeeTaxInfoResponse response = taxInfoService.createOrUpdateTaxInfo(employeeId, request);
        logger.info("Tax info created/updated for employee {}", employeeId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get specific tax info by ID
     */
    @GetMapping("/tax-info/{taxInfoId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> getTaxInfoById(@PathVariable UUID taxInfoId) {
        return taxInfoService.getTaxInfoById(taxInfoId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== US-Specific Endpoints ====================

    /**
     * Submit W-4 form (US Federal tax withholding)
     */
    @PostMapping("/tax-info/{taxInfoId}/us/w4")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<EmployeeTaxInfoResponse> submitW4(
            @PathVariable UUID taxInfoId,
            @Valid @RequestBody EmployeeTaxInfoRequest request) {

        EmployeeTaxInfoResponse response = taxInfoService.submitW4(taxInfoId, request);
        logger.info("W-4 submitted for tax info {}", taxInfoId);

        return ResponseEntity.ok(response);
    }

    /**
     * Get US employees without W-4 (Admin view)
     */
    @GetMapping("/organizations/{orgId}/tax-info/us/pending-w4")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<EmployeeTaxInfoResponse>> getUsEmployeesWithoutW4(
            @PathVariable UUID orgId) {

        List<EmployeeTaxInfoResponse> pending = taxInfoService.getUsEmployeesWithoutW4(orgId);
        return ResponseEntity.ok(pending);
    }

    // ==================== India-Specific Endpoints ====================

    /**
     * Submit India investment declaration
     */
    @PostMapping("/tax-info/{taxInfoId}/india/declaration")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<EmployeeTaxInfoResponse> submitIndiaDeclaration(
            @PathVariable UUID taxInfoId,
            @Valid @RequestBody EmployeeTaxInfoRequest request) {

        EmployeeTaxInfoResponse response = taxInfoService.updateIndiaDeclaration(taxInfoId, request);
        logger.info("India declaration submitted for tax info {}", taxInfoId);

        return ResponseEntity.ok(response);
    }

    /**
     * Get India employees under old regime (Admin view)
     */
    @GetMapping("/organizations/{orgId}/tax-info/india/old-regime")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<EmployeeTaxInfoResponse>> getIndiaOldRegimeEmployees(
            @PathVariable UUID orgId) {

        List<EmployeeTaxInfoResponse> employees = taxInfoService.getIndiaOldRegimeEmployees(orgId);
        return ResponseEntity.ok(employees);
    }

    // ==================== Organization Admin Endpoints ====================

    /**
     * Get all tax info for organization
     */
    @GetMapping("/organizations/{orgId}/tax-info")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<EmployeeTaxInfoResponse>> getOrganizationTaxInfo(
            @PathVariable UUID orgId) {

        List<EmployeeTaxInfoResponse> taxInfo = taxInfoService.getOrganizationTaxInfo(orgId);
        return ResponseEntity.ok(taxInfo);
    }

    /**
     * Get unverified tax records
     */
    @GetMapping("/organizations/{orgId}/tax-info/unverified")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<EmployeeTaxInfoResponse>> getUnverifiedTaxInfo(
            @PathVariable UUID orgId) {

        List<EmployeeTaxInfoResponse> unverified = taxInfoService.getUnverifiedTaxInfo(orgId);
        return ResponseEntity.ok(unverified);
    }

    /**
     * Verify tax information
     */
    @PostMapping("/tax-info/{taxInfoId}/verify")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<EmployeeTaxInfoResponse> verifyTaxInfo(
            @PathVariable UUID taxInfoId,
            @RequestParam UUID verifierId) {

        EmployeeTaxInfoResponse response = taxInfoService.verifyTaxInfo(taxInfoId, verifierId);
        logger.info("Tax info {} verified", taxInfoId);

        return ResponseEntity.ok(response);
    }

    /**
     * Unverify/reject tax information
     */
    @PostMapping("/tax-info/{taxInfoId}/unverify")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<EmployeeTaxInfoResponse> unverifyTaxInfo(
            @PathVariable UUID taxInfoId) {

        EmployeeTaxInfoResponse response = taxInfoService.unverifyTaxInfo(taxInfoId);
        logger.info("Tax info {} unverified", taxInfoId);

        return ResponseEntity.ok(response);
    }

    // ==================== Statistics Endpoints ====================

    /**
     * Get tax info statistics for organization
     */
    @GetMapping("/organizations/{orgId}/tax-info/stats")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> getTaxInfoStats(@PathVariable UUID orgId) {
        long withTaxInfo = taxInfoService.countEmployeesWithTaxInfo(orgId);
        long unverified = taxInfoService.countUnverifiedTaxInfo(orgId);

        return ResponseEntity.ok(Map.of(
                "employeesWithTaxInfo", withTaxInfo,
                "unverifiedRecords", unverified
        ));
    }

    /**
     * Check if employee has tax info
     */
    @GetMapping("/employees/{employeeId}/tax-info/exists")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, Boolean>> hasEmployeeTaxInfo(
            @PathVariable UUID employeeId) {

        boolean hasTaxInfo = taxInfoService.hasEmployeeTaxInfo(employeeId);
        return ResponseEntity.ok(Map.of("hasTaxInfo", hasTaxInfo));
    }

    // ==================== Onboarding Endpoint ====================

    /**
     * Initialize tax info during employee onboarding
     */
    @PostMapping("/employees/{employeeId}/tax-info/initialize")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<EmployeeTaxInfoResponse> initializeTaxInfo(
            @PathVariable UUID employeeId,
            @RequestParam String countryCode,
            @RequestParam(required = false) Integer taxYear) {

        int year = taxYear != null ? taxYear : java.time.Year.now().getValue();
        EmployeeTaxInfoResponse response = taxInfoService.createOnboardingTaxInfo(employeeId, countryCode, year);

        logger.info("Tax info initialized for employee {} country {}", employeeId, countryCode);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
