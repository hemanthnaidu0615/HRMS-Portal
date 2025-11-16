package com.hrms.controller;

import com.hrms.dto.CreateOrgAdminRequest;
import com.hrms.dto.CreateOrganizationRequest;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.repository.OrganizationRepository;
import com.hrms.service.EmailService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    public SuperAdminController(OrganizationRepository organizationRepository,
                               UserService userService,
                               EmailService emailService) {
        this.organizationRepository = organizationRepository;
        this.userService = userService;
        this.emailService = emailService;
    }

    @PostMapping("/organizations")
    public ResponseEntity<?> createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        Organization organization = new Organization(request.getName());
        Organization savedOrg = organizationRepository.save(organization);

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedOrg.getId());
        response.put("name", savedOrg.getName());
        response.put("createdAt", savedOrg.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/organizations")
    public ResponseEntity<?> getAllOrganizations() {
        List<Organization> organizations = organizationRepository.findAll();

        List<Map<String, Object>> response = organizations.stream().map(org -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", org.getId());
            map.put("name", org.getName());
            map.put("createdAt", org.getCreatedAt());
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/organizations/{orgId}/orgadmin")
    public ResponseEntity<?> createOrgAdmin(@PathVariable UUID orgId,
                                           @Valid @RequestBody CreateOrgAdminRequest request) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

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
        response.put("mustChangePassword", orgAdmin.isMustChangePassword());

        // Send email with temporary password
        try {
            emailService.sendTemporaryPasswordEmail(request.getEmail(), request.getTemporaryPassword());
            response.put("emailStatus", "sent");
        } catch (Exception e) {
            // Log error but don't fail the request - user was created successfully
            logger.error("Failed to send temporary password email to {}: {}", request.getEmail(), e.getMessage(), e);
            response.put("emailStatus", "failed");
            response.put("warning", "User created successfully but email delivery failed. Please provide credentials manually.");
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/organizations/{orgId}")
    public ResponseEntity<?> deactivateOrganization(@PathVariable UUID orgId) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (organization.isDeleted()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Organization is already deactivated"));
        }

        organization.setDeletedAt(java.time.LocalDateTime.now());
        organizationRepository.save(organization);

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
        organizationRepository.save(organization);

        return ResponseEntity.ok(Map.of("message", "Organization reactivated successfully"));
    }
}
