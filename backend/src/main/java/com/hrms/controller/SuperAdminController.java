package com.hrms.controller;

import com.hrms.dto.CreateOrgAdminRequest;
import com.hrms.dto.CreateOrganizationRequest;
import com.hrms.dto.OrganizationResponse;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.repository.OrganizationRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.UserRepository;
import com.hrms.repository.DocumentRepository;
import com.hrms.service.EmailService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/superadmin")
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminController {

    private static final Logger logger = LoggerFactory.getLogger(SuperAdminController.class);

    private final OrganizationRepository organizationRepository;
    private final UserService userService;
    private final EmailService emailService;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    public SuperAdminController(OrganizationRepository organizationRepository,
                               UserService userService,
                               EmailService emailService,
                               EmployeeRepository employeeRepository,
                               DepartmentRepository departmentRepository,
                               UserRepository userRepository,
                               DocumentRepository documentRepository) {
        this.organizationRepository = organizationRepository;
        this.userService = userService;
        this.emailService = emailService;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
    }

    @PostMapping("/organizations")
    public ResponseEntity<OrganizationResponse> createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        Organization organization = new Organization();

        // Map all fields from request to entity
        mapRequestToOrganization(request, organization);

        // Set subscription start date if not provided
        if (organization.getSubscriptionStartDate() == null) {
            organization.setSubscriptionStartDate(LocalDate.now());
        }

        // Set subscription status to trial for new organizations
        organization.setSubscriptionStatus("trial");
        organization.setIsActive(true);

        Organization savedOrg = organizationRepository.save(organization);
        logger.info("Organization created: {} (ID: {})", savedOrg.getName(), savedOrg.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(OrganizationResponse.fromEntity(savedOrg));
    }

    @GetMapping("/organizations")
    public ResponseEntity<List<OrganizationResponse>> getAllOrganizations() {
        List<Organization> organizations = organizationRepository.findAll();

        List<OrganizationResponse> response = organizations.stream()
            .map(org -> {
                OrganizationResponse dto = OrganizationResponse.fromEntity(org);

                // Add organization metrics
                long employeeCount = employeeRepository.countByOrganizationAndDeletedAtIsNull(org);
                long departmentCount = departmentRepository.countByOrganizationAndDeletedAtIsNull(org);
                long activeUserCount = userRepository.countByOrganizationAndEnabledTrue(org);
                long documentCount = documentRepository.countByEmployee_Organization(org);
                long orgAdminCount = userRepository.countByOrganizationAndRoles_NameAndEnabledTrue(org, "ORGADMIN");

                return dto.withMetrics(employeeCount, departmentCount, activeUserCount, documentCount, orgAdminCount);
            })
            .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/organizations/{orgId}")
    public ResponseEntity<OrganizationResponse> getOrganization(@PathVariable UUID orgId) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        OrganizationResponse response = OrganizationResponse.fromEntity(organization);

        // Add metrics
        long employeeCount = employeeRepository.countByOrganizationAndDeletedAtIsNull(organization);
        long departmentCount = departmentRepository.countByOrganizationAndDeletedAtIsNull(organization);
        long activeUserCount = userRepository.countByOrganizationAndEnabledTrue(organization);
        long documentCount = documentRepository.countByEmployee_Organization(organization);
        long orgAdminCount = userRepository.countByOrganizationAndRoles_NameAndEnabledTrue(organization, "ORGADMIN");

        response.withMetrics(employeeCount, departmentCount, activeUserCount, documentCount, orgAdminCount);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/organizations/{orgId}")
    public ResponseEntity<OrganizationResponse> updateOrganization(
            @PathVariable UUID orgId,
            @Valid @RequestBody CreateOrganizationRequest request) {

        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (organization.isDeleted()) {
            return ResponseEntity.badRequest().build();
        }

        // Map all fields from request to entity
        mapRequestToOrganization(request, organization);

        Organization savedOrg = organizationRepository.save(organization);
        logger.info("Organization updated: {} (ID: {})", savedOrg.getName(), savedOrg.getId());

        return ResponseEntity.ok(OrganizationResponse.fromEntity(savedOrg));
    }

    @GetMapping("/organizations/{orgId}/orgadmins")
    public ResponseEntity<?> getOrgAdmins(@PathVariable UUID orgId) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Find all users with ORGADMIN role for this organization
        List<User> orgAdmins = userRepository.findByOrganizationAndRoles_Name(organization, "ORGADMIN");

        List<Map<String, Object>> response = orgAdmins.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("email", user.getEmail());
            map.put("enabled", user.isEnabled());
            map.put("createdAt", user.getCreatedAt());
            map.put("mustChangePassword", user.isMustChangePassword());

            // Get employee details if exists
            employeeRepository.findByUser(user).ifPresent(emp -> {
                map.put("employeeId", emp.getId());
                map.put("firstName", emp.getFirstName());
                map.put("lastName", emp.getLastName());
                map.put("fullName", emp.getFullName());
                map.put("phoneNumber", emp.getPhoneNumber());
                map.put("designation", emp.getDesignation());
            });

            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/organizations/{orgId}/orgadmin")
    public ResponseEntity<?> createOrgAdmin(@PathVariable UUID orgId,
                                           @Valid @RequestBody CreateOrgAdminRequest request) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (organization.isDeleted()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot create admin for deleted organization"));
        }

        if (userService.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        User orgAdmin = userService.createOrgAdmin(
                request.getEmail(),
                request.getTemporaryPassword(),
                organization
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", orgAdmin.getId());
        response.put("email", orgAdmin.getEmail());
        response.put("organizationId", orgAdmin.getOrganization().getId());
        response.put("organizationName", orgAdmin.getOrganization().getName());
        response.put("mustChangePassword", orgAdmin.isMustChangePassword());

        // Send email with temporary password
        try {
            emailService.sendTemporaryPasswordEmail(request.getEmail(), request.getTemporaryPassword());
            response.put("emailStatus", "sent");
            logger.info("OrgAdmin created and email sent: {} for organization: {}",
                    request.getEmail(), organization.getName());
        } catch (Exception e) {
            logger.error("Failed to send temporary password email to {}: {}", request.getEmail(), e.getMessage(), e);
            response.put("emailStatus", "failed");
            response.put("warning", "User created successfully but email delivery failed. Please provide credentials manually.");
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(response);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/organizations/{orgId}")
    public ResponseEntity<?> deactivateOrganization(@PathVariable UUID orgId) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (organization.isDeleted()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Organization is already deactivated"));
        }

        organization.setDeletedAt(java.time.LocalDateTime.now());
        organization.setIsActive(false);
        organizationRepository.save(organization);

        logger.info("Organization deactivated: {} (ID: {})", organization.getName(), organization.getId());

        return ResponseEntity.ok(Map.of("message", "Organization deactivated successfully"));
    }

    @PostMapping("/organizations/{orgId}/reactivate")
    public ResponseEntity<?> reactivateOrganization(@PathVariable UUID orgId) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (!organization.isDeleted()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Organization is not deactivated"));
        }

        organization.setDeletedAt(null);
        organization.setIsActive(true);
        organizationRepository.save(organization);

        logger.info("Organization reactivated: {} (ID: {})", organization.getName(), organization.getId());

        return ResponseEntity.ok(Map.of("message", "Organization reactivated successfully"));
    }

    /**
     * Helper method to map request fields to organization entity
     */
    private void mapRequestToOrganization(CreateOrganizationRequest request, Organization organization) {
        // Required field
        organization.setName(request.getName());

        // Business Details
        if (request.getIndustry() != null) {
            organization.setIndustry(request.getIndustry());
        }
        if (request.getOrganizationSize() != null) {
            organization.setOrganizationSize(request.getOrganizationSize());
        }
        if (request.getRegistrationNumber() != null) {
            organization.setRegistrationNumber(request.getRegistrationNumber());
        }
        if (request.getTaxId() != null) {
            organization.setTaxId(request.getTaxId());
        }

        // Contact Information
        if (request.getEmail() != null) {
            organization.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            organization.setPhone(request.getPhone());
        }
        if (request.getWebsite() != null) {
            organization.setWebsite(request.getWebsite());
        }

        // Address
        if (request.getAddressLine1() != null) {
            organization.setAddressLine1(request.getAddressLine1());
        }
        if (request.getAddressLine2() != null) {
            organization.setAddressLine2(request.getAddressLine2());
        }
        if (request.getCity() != null) {
            organization.setCity(request.getCity());
        }
        if (request.getState() != null) {
            organization.setState(request.getState());
        }
        if (request.getCountry() != null) {
            organization.setCountry(request.getCountry());
        }
        if (request.getCountryCode() != null) {
            organization.setCountryCode(request.getCountryCode());
        }
        if (request.getPostalCode() != null) {
            organization.setPostalCode(request.getPostalCode());
        }

        // Configuration
        if (request.getTimezone() != null) {
            organization.setTimezone(request.getTimezone());
        }
        if (request.getDefaultCurrency() != null) {
            organization.setDefaultCurrency(request.getDefaultCurrency());
        }
        if (request.getDateFormat() != null) {
            organization.setDateFormat(request.getDateFormat());
        }
        if (request.getFiscalYearStartMonth() != null) {
            organization.setFiscalYearStartMonth(request.getFiscalYearStartMonth());
        }

        // Subscription
        if (request.getSubscriptionPlan() != null) {
            organization.setSubscriptionPlan(request.getSubscriptionPlan());
        }
        if (request.getSubscriptionStartDate() != null) {
            organization.setSubscriptionStartDate(request.getSubscriptionStartDate());
        }
        if (request.getSubscriptionEndDate() != null) {
            organization.setSubscriptionEndDate(request.getSubscriptionEndDate());
        }
        if (request.getMaxEmployees() != null) {
            organization.setMaxEmployees(request.getMaxEmployees());
        }
    }
}
