package com.hrms.service;

import com.hrms.entity.Organization;
import com.hrms.entity.Permission;
import com.hrms.entity.Role;
import com.hrms.repository.PermissionRepository;
import com.hrms.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public RoleService(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    /**
     * Get all roles available for an organization (system roles + org-specific roles)
     */
    public List<Role> getAvailableRoles(Organization organization) {
        return roleRepository.findAllAvailableForOrganization(organization);
    }

    /**
     * Get only custom roles for an organization (excludes system roles)
     */
    public List<Role> getCustomRoles(Organization organization) {
        return roleRepository.findByOrganizationAndSystemRoleFalse(organization);
    }

    /**
     * Get role by ID
     */
    public Role getRoleById(Integer roleId) {
        return roleRepository.findById(roleId)
            .orElseThrow(() -> new RuntimeException("Role not found"));
    }

    /**
     * Create a custom role for an organization
     */
    @Transactional
    public Role createRole(Organization organization, String name, String description, List<UUID> permissionIds) {
        // Check if role name already exists in this org
        if (roleRepository.existsByNameAndOrganization(name, organization)) {
            throw new RuntimeException("Role with this name already exists in your organization");
        }

        // Create role
        Role role = new Role(name, organization);
        role.setDescription(description);
        role.setSystemRole(false);

        // Add permissions
        if (permissionIds != null && !permissionIds.isEmpty()) {
            Set<Permission> permissions = permissionIds.stream()
                .map(id -> permissionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Permission not found: " + id)))
                .collect(Collectors.toSet());
            role.setPermissions(permissions);
        }

        return roleRepository.save(role);
    }

    /**
     * Update a custom role
     */
    @Transactional
    public Role updateRole(Integer roleId, Organization organization, String name, String description, List<UUID> permissionIds) {
        Role role = getRoleById(roleId);

        // Ensure role belongs to this organization
        if (role.getOrganization() == null || !role.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Access denied: Role does not belong to your organization");
        }

        // Cannot modify system roles
        if (role.isSystemRole()) {
            throw new RuntimeException("Cannot modify system roles");
        }

        // Update name if provided
        if (name != null && !name.equals(role.getName())) {
            if (roleRepository.existsByNameAndOrganization(name, organization)) {
                throw new RuntimeException("Role with this name already exists in your organization");
            }
            role.setName(name);
        }

        // Update description
        if (description != null) {
            role.setDescription(description);
        }

        // Update permissions
        if (permissionIds != null) {
            Set<Permission> permissions = permissionIds.stream()
                .map(id -> permissionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Permission not found: " + id)))
                .collect(Collectors.toSet());
            role.setPermissions(permissions);
        }

        return roleRepository.save(role);
    }

    /**
     * Delete a custom role
     */
    @Transactional
    public void deleteRole(Integer roleId, Organization organization) {
        Role role = getRoleById(roleId);

        // Ensure role belongs to this organization
        if (role.getOrganization() == null || !role.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Access denied: Role does not belong to your organization");
        }

        // Cannot delete system roles
        if (role.isSystemRole()) {
            throw new RuntimeException("Cannot delete system roles");
        }

        roleRepository.delete(role);
    }
}
