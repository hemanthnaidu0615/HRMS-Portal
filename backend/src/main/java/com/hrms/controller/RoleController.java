package com.hrms.controller;

import com.hrms.dto.*;
import com.hrms.entity.Organization;
import com.hrms.entity.Permission;
import com.hrms.entity.Role;
import com.hrms.entity.User;
import com.hrms.service.PermissionService;
import com.hrms.service.RoleService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orgadmin/roles")
@PreAuthorize("hasRole('ORGADMIN')")
public class RoleController {

    private final RoleService roleService;
    private final PermissionService permissionService;
    private final UserService userService;

    public RoleController(RoleService roleService, PermissionService permissionService, UserService userService) {
        this.roleService = roleService;
        this.permissionService = permissionService;
        this.userService = userService;
    }

    /**
     * Get all roles available for current organization
     */
    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        List<RoleResponse> roles = roleService.getAvailableRoles(organization).stream()
            .map(this::toRoleResponse)
            .collect(Collectors.toList());

        return ResponseEntity.ok(roles);
    }

    /**
     * Get role details with permissions
     */
    @GetMapping("/{roleId}")
    public ResponseEntity<RoleDetailResponse> getRoleDetail(@PathVariable Integer roleId, Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleService.getRoleById(roleId);

        // Check access: system roles are visible to all, custom roles only to their org
        if (!role.isSystemRole()) {
            if (role.getOrganization() == null || 
                currentUser.getOrganization() == null ||
                !role.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                return ResponseEntity.status(403).build();
            }
        }

        return ResponseEntity.ok(toRoleDetailResponse(role));
    }

    /**
     * Create a custom role
     */
    @PostMapping
    public ResponseEntity<RoleDetailResponse> createRole(
            @Valid @RequestBody CreateRoleRequest request,
            Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        // Check if user has permission to create roles
        if (!permissionService.hasPermission(currentUser, "roles:create:organization")) {
            return ResponseEntity.status(403).build();
        }

        Role role = roleService.createRole(
            organization,
            request.getName(),
            request.getDescription(),
            request.getPermissionIds()
        );

        return ResponseEntity.ok(toRoleDetailResponse(role));
    }

    /**
     * Update a custom role
     */
    @PutMapping("/{roleId}")
    public ResponseEntity<RoleDetailResponse> updateRole(
            @PathVariable Integer roleId,
            @Valid @RequestBody UpdateRoleRequest request,
            Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        // Check if user has permission to edit roles
        if (!permissionService.hasPermission(currentUser, "roles:edit:organization")) {
            return ResponseEntity.status(403).build();
        }

        Role role = roleService.updateRole(
            roleId,
            organization,
            request.getName(),
            request.getDescription(),
            request.getPermissionIds()
        );

        return ResponseEntity.ok(toRoleDetailResponse(role));
    }

    /**
     * Delete a custom role
     */
    @DeleteMapping("/{roleId}")
    public ResponseEntity<Void> deleteRole(@PathVariable Integer roleId, Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        // Check if user has permission to delete roles
        if (!permissionService.hasPermission(currentUser, "roles:delete:organization")) {
            return ResponseEntity.status(403).build();
        }

        roleService.deleteRole(roleId, organization);

        return ResponseEntity.noContent().build();
    }

    private RoleResponse toRoleResponse(Role role) {
        return new RoleResponse(
            role.getId(),
            role.getName(),
            role.getDescription(),
            role.isSystemRole(),
            role.getCreatedAt()
        );
    }

    private RoleDetailResponse toRoleDetailResponse(Role role) {
        List<PermissionResponse> permissions = role.getPermissions().stream()
            .map(p -> new PermissionResponse(
                p.getId(),
                p.getCode(),
                p.getDescription()
            ))
            .collect(Collectors.toList());

        return new RoleDetailResponse(
            role.getId(),
            role.getName(),
            role.getDescription(),
            role.isSystemRole(),
            role.getCreatedAt(),
            permissions
        );
    }
}
