package com.hrms.controller;

import com.hrms.entity.User;
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
 * Returns permissions computed from user roles in resource:action:scope format
 */
@RestController
@RequestMapping("/api/me")
public class PermissionsController {

    private final UserService userService;
    private final PermissionService permissionService;

    public PermissionsController(UserService userService, PermissionService permissionService) {
        this.userService = userService;
        this.permissionService = permissionService;
    }

    /**
     * Get effective permissions for the current user
     * Returns permissions in format: ["employees:view:own", "documents:upload:team", ...]
     */
    @GetMapping("/permissions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Set<String>> getMyPermissions(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // SuperAdmin should have no organization-level permissions
        if (permissionService.isSuperAdmin(user)) {
            return ResponseEntity.ok(Set.of());
        }

        // Get all permissions from user's roles
        Set<String> permissions = permissionService.getAllPermissionCodes(user);

        return ResponseEntity.ok(permissions);
    }
}
