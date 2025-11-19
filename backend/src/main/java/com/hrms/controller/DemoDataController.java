package com.hrms.controller;

import com.hrms.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Demo Data Management Controller
 * ONLY available when 'demo' profile is active
 * Provides endpoints to clean up demo data for testing purposes
 */
@RestController
@RequestMapping("/api/demo")
@Profile("demo") // Only active in demo profile
public class DemoDataController {

    private static final Logger logger = LoggerFactory.getLogger(DemoDataController.class);

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final ClientRepository clientRepository;
    private final VendorRepository vendorRepository;
    private final ProjectRepository projectRepository;

    public DemoDataController(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            PositionRepository positionRepository,
            ClientRepository clientRepository,
            VendorRepository vendorRepository,
            ProjectRepository projectRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
        this.clientRepository = clientRepository;
        this.vendorRepository = vendorRepository;
        this.projectRepository = projectRepository;
    }

    /**
     * Delete all demo data (organizations starting with "Demo")
     * WARNING: This will delete all demo organizations and related data!
     *
     * Requires SYSADMIN role for safety
     */
    @DeleteMapping("/cleanup")
    @PreAuthorize("hasRole('SYSADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> cleanupDemoData() {
        logger.warn("======================================");
        logger.warn("Starting demo data cleanup...");
        logger.warn("======================================");

        Map<String, Object> result = new HashMap<>();
        int deletedCounts = 0;

        try {
            // Find all demo organizations (those starting with "Demo ")
            var demoOrgs = organizationRepository.findAll().stream()
                    .filter(org -> org.getName().startsWith("Demo "))
                    .toList();

            if (demoOrgs.isEmpty()) {
                result.put("success", false);
                result.put("message", "No demo data found to delete");
                return ResponseEntity.ok(result);
            }

            // Delete related data for each demo organization
            for (var org : demoOrgs) {
                logger.info("Deleting data for organization: {}", org.getName());

                // Delete employees (must be first due to foreign key constraints)
                int employeesDeleted = employeeRepository.deleteByOrganization(org);
                logger.info("  - Deleted {} employees", employeesDeleted);

                // Delete users
                int usersDeleted = userRepository.deleteByOrganization(org);
                logger.info("  - Deleted {} users", usersDeleted);

                // Delete projects
                int projectsDeleted = projectRepository.deleteByOrganization(org);
                logger.info("  - Deleted {} projects", projectsDeleted);

                // Delete clients
                int clientsDeleted = clientRepository.deleteByOrganization(org);
                logger.info("  - Deleted {} clients", clientsDeleted);

                // Delete vendors
                int vendorsDeleted = vendorRepository.deleteByOrganization(org);
                logger.info("  - Deleted {} vendors", vendorsDeleted);

                // Delete positions
                int positionsDeleted = positionRepository.deleteByOrganization(org);
                logger.info("  - Deleted {} positions", positionsDeleted);

                // Delete departments
                int departmentsDeleted = departmentRepository.deleteByOrganization(org);
                logger.info("  - Deleted {} departments", departmentsDeleted);

                deletedCounts += employeesDeleted + usersDeleted + projectsDeleted +
                                clientsDeleted + vendorsDeleted + positionsDeleted + departmentsDeleted;
            }

            // Finally, delete the organizations
            int orgsDeleted = demoOrgs.size();
            organizationRepository.deleteAll(demoOrgs);
            logger.info("Deleted {} demo organizations", orgsDeleted);

            logger.warn("======================================");
            logger.warn("Demo data cleanup completed!");
            logger.warn("Total organizations deleted: {}", orgsDeleted);
            logger.warn("Total related records deleted: {}", deletedCounts);
            logger.warn("======================================");

            result.put("success", true);
            result.put("message", "Demo data cleaned up successfully");
            result.put("organizationsDeleted", orgsDeleted);
            result.put("totalRecordsDeleted", deletedCounts);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error during demo data cleanup", e);
            result.put("success", false);
            result.put("message", "Error during cleanup: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    /**
     * Get count of demo data records
     */
    @GetMapping("/count")
    @PreAuthorize("hasRole('SYSADMIN')")
    public ResponseEntity<Map<String, Object>> getDemoDataCount() {
        Map<String, Object> result = new HashMap<>();

        var demoOrgs = organizationRepository.findAll().stream()
                .filter(org -> org.getName().startsWith("Demo "))
                .toList();

        long totalEmployees = 0;
        long totalUsers = 0;
        long totalProjects = 0;
        long totalClients = 0;
        long totalVendors = 0;
        long totalPositions = 0;
        long totalDepartments = 0;

        for (var org : demoOrgs) {
            totalEmployees += employeeRepository.countByOrganization(org);
            totalUsers += userRepository.countByOrganization(org);
            totalProjects += projectRepository.countByOrganization(org);
            totalClients += clientRepository.countByOrganization(org);
            totalVendors += vendorRepository.countByOrganization(org);
            totalPositions += positionRepository.countByOrganization(org);
            totalDepartments += departmentRepository.countByOrganization(org);
        }

        result.put("demoOrganizations", demoOrgs.size());
        result.put("totalEmployees", totalEmployees);
        result.put("totalUsers", totalUsers);
        result.put("totalProjects", totalProjects);
        result.put("totalClients", totalClients);
        result.put("totalVendors", totalVendors);
        result.put("totalPositions", totalPositions);
        result.put("totalDepartments", totalDepartments);

        return ResponseEntity.ok(result);
    }
}
