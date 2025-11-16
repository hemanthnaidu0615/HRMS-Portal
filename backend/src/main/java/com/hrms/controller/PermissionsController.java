package com.hrms.controller;

import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.PermissionService;
import com.hrms.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

/**
 * Controller for retrieving user permissions
 * Replaces hardcoded frontend permissions with backend-computed values
 */
@RestController
@RequestMapping("/api/me")
public class PermissionsController {

    private final UserService userService;
    private final EmployeeRepository employeeRepository;
    private final PermissionService permissionService;

    public PermissionsController(UserService userService,
                                EmployeeRepository employeeRepository,
                                PermissionService permissionService) {
        this.userService = userService;
        this.employeeRepository = employeeRepository;
        this.permissionService = permissionService;
    }

    /**
     * Get effective permissions for the current user
     * Returns permissions computed from their permission groups
     */
    @GetMapping("/permissions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Set<String>> getMyPermissions(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get or create employee record
        Employee employee = employeeRepository.findByUser_Id(user.getId())
                .orElseGet(() -> {
                    if (user.getOrganization() == null) {
                        // SuperAdmin users might not have employee records
                        return null;
                    }
                    // This will auto-assign permission groups based on role
                    return employeeRepository.save(new com.hrms.entity.Employee(user, user.getOrganization()));
                });

        Set<String> permissions;
        if (employee != null) {
            permissions = permissionService.getEffectivePermissions(employee);
        } else {
            // SuperAdmin has all permissions
            permissions = Set.of(
                "VIEW_OWN_DOCS",
                "UPLOAD_OWN_DOCS",
                "REQUEST_DOCS",
                "VIEW_ORG_DOCS",
                "UPLOAD_FOR_OTHERS",
                "VIEW_DEPT_DOCS"
            );
        }

        return ResponseEntity.ok(permissions);
    }
}
