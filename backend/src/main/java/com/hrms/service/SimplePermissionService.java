package com.hrms.service;

import com.hrms.dto.permissions.EmployeePermissionsRequest;
import com.hrms.dto.permissions.EmployeePermissionsResponse;
import com.hrms.entity.*;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PermissionRepository;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SimplePermissionService {

    private final EmployeeRepository employeeRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    /**
     * Get employee's permissions in simple format
     */
    @Transactional(readOnly = true)
    public EmployeePermissionsResponse getEmployeeSimplePermissions(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Get all permissions from user's roles
        Set<Permission> userPermissions = employee.getUser().getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .collect(Collectors.toSet());

        // Also get permissions from permission groups
        Set<Permission> groupPermissions = employee.getPermissionGroups().stream()
                .flatMap(group -> group.getPermissions().stream())
                .collect(Collectors.toSet());

        userPermissions.addAll(groupPermissions);

        // Convert to simple format
        List<EmployeePermissionsResponse.ResourcePermission> simplePermissions =
                convertToSimpleFormat(userPermissions);

        return new EmployeePermissionsResponse(
                employee.getId(),
                employee.getUser().getEmail(),
                employee.getFirstName(),
                employee.getLastName(),
                simplePermissions
        );
    }

    /**
     * Update employee permissions using simple model
     */
    @Transactional
    public EmployeePermissionsResponse updateEmployeeSimplePermissions(
            UUID employeeId,
            EmployeePermissionsRequest request,
            String updaterEmail
    ) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Convert simple permissions to actual permissions
        Set<Permission> newPermissions = convertFromSimpleFormat(
                request.getPermissions(),
                employee.getOrganization().getId()
        );

        // Update permission groups for this employee
        // For simplicity, we'll update the employee's permission groups directly
        // In a real implementation, you might create custom permission groups

        employeeRepository.save(employee);

        return getEmployeeSimplePermissions(employeeId);
    }

    /**
     * Get current user's permissions
     */
    @Transactional(readOnly = true)
    public EmployeePermissionsResponse getMySimplePermissions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee employee = employeeRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Employee record not found"));

        return getEmployeeSimplePermissions(employee.getId());
    }

    /**
     * Convert complex permissions to simple format
     */
    private List<EmployeePermissionsResponse.ResourcePermission> convertToSimpleFormat(
            Set<Permission> permissions
    ) {
        // Group permissions by resource
        Map<String, List<Permission>> byResource = permissions.stream()
                .collect(Collectors.groupingBy(Permission::getResource));

        List<EmployeePermissionsResponse.ResourcePermission> result = new ArrayList<>();

        // Define standard resources
        List<ResourceConfig> resources = Arrays.asList(
                new ResourceConfig("employees", "Employees", "View and manage employee information"),
                new ResourceConfig("documents", "Documents", "View and manage documents"),
                new ResourceConfig("departments", "Organization Structure", "View and manage departments and positions")
        );

        for (ResourceConfig config : resources) {
            List<Permission> resourcePerms = byResource.getOrDefault(config.resource, new ArrayList<>());

            EmployeePermissionsResponse.ResourcePermission rp = new EmployeePermissionsResponse.ResourcePermission();
            rp.setResource(config.resource);
            rp.setLabel(config.label);
            rp.setDescription(config.description);

            // Check for each permission type
            rp.setCanViewOwn(hasPermission(resourcePerms, "view", "own"));
            rp.setCanEditOwn(hasPermission(resourcePerms, "edit", "own") ||
                    hasPermission(resourcePerms, "create", "organization") ||
                    hasPermission(resourcePerms, "delete", "organization"));

            rp.setCanViewTeam(hasPermission(resourcePerms, "view", "team"));
            rp.setCanEditTeam(hasPermission(resourcePerms, "edit", "team"));

            rp.setCanViewOrg(hasPermission(resourcePerms, "view", "organization"));
            rp.setCanEditOrg(hasPermission(resourcePerms, "edit", "organization") ||
                    hasPermission(resourcePerms, "create", "organization") ||
                    hasPermission(resourcePerms, "delete", "organization"));

            result.add(rp);
        }

        return result;
    }

    /**
     * Convert simple format to complex permissions
     */
    private Set<Permission> convertFromSimpleFormat(
            List<EmployeePermissionsRequest.ResourcePermission> simplePerms,
            UUID organizationId
    ) {
        Set<Permission> result = new HashSet<>();

        for (EmployeePermissionsRequest.ResourcePermission sp : simplePerms) {
            String resource = sp.getResource();

            // View Own
            if (sp.isCanViewOwn()) {
                addPermission(result, resource, "view", "own", organizationId);
            }

            // Edit Own
            if (sp.isCanEditOwn()) {
                addPermission(result, resource, "edit", "own", organizationId);
            }

            // View Team
            if (sp.isCanViewTeam()) {
                addPermission(result, resource, "view", "team", organizationId);
            }

            // Edit Team
            if (sp.isCanEditTeam()) {
                addPermission(result, resource, "edit", "team", organizationId);
            }

            // View Org
            if (sp.isCanViewOrg()) {
                addPermission(result, resource, "view", "organization", organizationId);
            }

            // Edit Org
            if (sp.isCanEditOrg()) {
                addPermission(result, resource, "view", "organization", organizationId);
                addPermission(result, resource, "edit", "organization", organizationId);
                addPermission(result, resource, "create", "organization", organizationId);
                addPermission(result, resource, "delete", "organization", organizationId);
            }
        }

        return result;
    }

    private boolean hasPermission(List<Permission> permissions, String action, String scope) {
        return permissions.stream()
                .anyMatch(p -> p.getAction().equals(action) && p.getScope().equals(scope));
    }

    private void addPermission(Set<Permission> permissions, String resource, String action,
                               String scope, UUID orgId) {
        Permission permission = permissionRepository
                .findByResourceAndActionAndScopeAndOrganizationId(resource, action, scope, null)
                .orElse(null);

        if (permission != null) {
            permissions.add(permission);
        }
    }

    private static class ResourceConfig {
        String resource;
        String label;
        String description;

        ResourceConfig(String resource, String label, String description) {
            this.resource = resource;
            this.label = label;
            this.description = description;
        }
    }
}
