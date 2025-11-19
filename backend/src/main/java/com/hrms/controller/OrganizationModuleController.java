package com.hrms.controller;

import com.hrms.dto.OrganizationModuleDTO;
import com.hrms.dto.UpdateOrganizationModulesRequest;
import com.hrms.entity.Organization;
import com.hrms.entity.OrganizationModule;
import com.hrms.repository.OrganizationModuleRepository;
import com.hrms.repository.OrganizationRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superadmin/organizations/{orgId}/modules")
@PreAuthorize("hasRole('SUPERADMIN')")
public class OrganizationModuleController {

    private static final Logger logger = LoggerFactory.getLogger(OrganizationModuleController.class);

    // Available modules in the system
    private static final List<String> AVAILABLE_MODULES = Arrays.asList(
        "ATTENDANCE", "LEAVE", "TIMESHEET", "PAYROLL", "PERFORMANCE",
        "RECRUITMENT", "ASSETS", "EXPENSES", "PROJECTS"
    );

    private final OrganizationModuleRepository moduleRepository;
    private final OrganizationRepository organizationRepository;

    public OrganizationModuleController(OrganizationModuleRepository moduleRepository,
                                       OrganizationRepository organizationRepository) {
        this.moduleRepository = moduleRepository;
        this.organizationRepository = organizationRepository;
    }

    /**
     * Get all modules for an organization
     * Returns all available modules with their status (enabled/disabled)
     */
    @GetMapping
    public ResponseEntity<?> getOrganizationModules(@PathVariable UUID orgId) {
        try {
            Organization organization = organizationRepository.findById(orgId)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            // Get existing modules for this organization
            List<OrganizationModule> existingModules = moduleRepository.findByOrganizationId(orgId);
            Map<String, OrganizationModule> moduleMap = existingModules.stream()
                    .collect(Collectors.toMap(OrganizationModule::getModuleName, m -> m));

            // Create response with all available modules
            List<OrganizationModuleDTO> response = AVAILABLE_MODULES.stream()
                    .map(moduleName -> {
                        OrganizationModule module = moduleMap.get(moduleName);
                        if (module != null) {
                            return mapToDTO(module);
                        } else {
                            // Create default disabled module
                            OrganizationModuleDTO dto = new OrganizationModuleDTO();
                            dto.setModuleName(moduleName);
                            dto.setIsEnabled(false);
                            dto.setUserLimit(null);
                            dto.setExpiryDate(null);
                            return dto;
                        }
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching modules for organization {}: {}", orgId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update modules for an organization (batch update)
     */
    @PutMapping
    public ResponseEntity<?> updateOrganizationModules(
            @PathVariable UUID orgId,
            @Valid @RequestBody List<UpdateOrganizationModulesRequest> modulesRequest) {
        try {
            Organization organization = organizationRepository.findById(orgId)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            // Validate that at least one module is enabled
            long enabledCount = modulesRequest.stream()
                    .filter(UpdateOrganizationModulesRequest::getIsEnabled)
                    .count();

            if (enabledCount == 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "At least one module must be enabled"));
            }

            // Get existing modules
            List<OrganizationModule> existingModules = moduleRepository.findByOrganizationId(orgId);
            Map<String, OrganizationModule> moduleMap = existingModules.stream()
                    .collect(Collectors.toMap(OrganizationModule::getModuleName, m -> m));

            // Update or create modules
            List<OrganizationModule> modulesToSave = new ArrayList<>();
            for (UpdateOrganizationModulesRequest request : modulesRequest) {
                // Validate module name
                if (!AVAILABLE_MODULES.contains(request.getModuleName())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid module name: " + request.getModuleName()));
                }

                OrganizationModule module = moduleMap.get(request.getModuleName());
                if (module == null) {
                    // Create new module
                    module = new OrganizationModule();
                    module.setOrganization(organization);
                    module.setModuleName(request.getModuleName());
                }

                // Update module properties
                module.setIsEnabled(request.getIsEnabled());
                module.setUserLimit(request.getUserLimit());
                module.setExpiryDate(request.getExpiryDate());

                modulesToSave.add(module);
            }

            // Save all modules
            moduleRepository.saveAll(modulesToSave);

            logger.info("Updated modules for organization {}: {} modules enabled", orgId, enabledCount);

            return ResponseEntity.ok(Map.of(
                    "message", "Modules updated successfully",
                    "enabledCount", enabledCount
            ));

        } catch (Exception e) {
            logger.error("Error updating modules for organization {}: {}", orgId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get count of enabled modules for an organization
     */
    @GetMapping("/count")
    public ResponseEntity<?> getEnabledModulesCount(@PathVariable UUID orgId) {
        try {
            Organization organization = organizationRepository.findById(orgId)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            long count = moduleRepository.countByOrganizationAndIsEnabled(organization, true);

            return ResponseEntity.ok(Map.of(
                    "organizationId", orgId,
                    "enabledModulesCount", count
            ));
        } catch (Exception e) {
            logger.error("Error counting modules for organization {}: {}", orgId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Helper method to map entity to DTO
    private OrganizationModuleDTO mapToDTO(OrganizationModule module) {
        return new OrganizationModuleDTO(
                module.getId(),
                module.getModuleName(),
                module.getIsEnabled(),
                module.getUserLimit(),
                module.getExpiryDate(),
                module.getCreatedAt(),
                module.getUpdatedAt()
        );
    }
}
