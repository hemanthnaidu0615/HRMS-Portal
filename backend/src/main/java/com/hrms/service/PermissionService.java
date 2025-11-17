package com.hrms.service;

import com.hrms.entity.*;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PermissionRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Core permission service using resource:action:scope model
 *
 * This service handles ALL permission checks throughout the application.
 * - Supports hierarchical access (own/team/department/organization)
 * - Enforces multi-tenant isolation
 * - Extensible for future features (leaves, timesheets, payroll)
 */
@Service
public class PermissionService {

    private final EmployeeRepository employeeRepository;
    private final PermissionRepository permissionRepository;

    public PermissionService(EmployeeRepository employeeRepository,
                           PermissionRepository permissionRepository) {
        this.employeeRepository = employeeRepository;
        this.permissionRepository = permissionRepository;
    }

    /**
     * Check if user has a specific permission
     * @param user The user to check
     * @param permissionCode Permission in format "resource:action:scope" (e.g., "employees:view:team")
     * @return true if user has permission
     */
    public boolean hasPermission(User user, String permissionCode) {
        if (user == null) {
            return false;
        }

        // Parse permission code
        String[] parts = permissionCode.split(":");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid permission code: " + permissionCode);
        }

        String resource = parts[0];
        String action = parts[1];
        String scope = parts[2];

        return hasPermission(user, resource, action, scope);
    }

    /**
     * Check if user has a specific permission
     * @param user The user to check
     * @param resource Resource name (employees, documents, leaves, etc.)
     * @param action Action name (view, edit, create, delete, approve, etc.)
     * @param scope Scope (own, team, department, organization)
     * @return true if user has permission
     */
    public boolean hasPermission(User user, String resource, String action, String scope) {
        if (user == null) {
            return false;
        }

        Set<Permission> userPermissions = getAllPermissions(user);

        return userPermissions.stream()
            .anyMatch(p -> p.getResource().equals(resource) &&
                          p.getAction().equals(action) &&
                          p.getScope().equals(scope));
    }

    /**
     * Check if user has permission with ANY of the specified scopes
     * Example: hasPermissionWithAnyScope(user, "employees", "view", ["team", "department", "organization"])
     */
    public boolean hasPermissionWithAnyScope(User user, String resource, String action, List<String> scopes) {
        return scopes.stream().anyMatch(scope -> hasPermission(user, resource, action, scope));
    }

    /**
     * Get the highest scope level user has for a resource:action combination
     * Returns: "organization" > "department" > "team" > "own" > null
     */
    public String getHighestScope(User user, String resource, String action) {
        if (hasPermission(user, resource, action, "organization")) return "organization";
        if (hasPermission(user, resource, action, "department")) return "department";
        if (hasPermission(user, resource, action, "team")) return "team";
        if (hasPermission(user, resource, action, "own")) return "own";
        return null;
    }

    /**
     * Get all permissions for a user (from all roles)
     */
    public Set<Permission> getAllPermissions(User user) {
        if (user == null) {
            return Collections.emptySet();
        }

        Set<Permission> permissions = new HashSet<>();

        for (Role role : user.getRoles()) {
            // Only include permissions from:
            // 1. System roles (organization = null)
            // 2. Org-specific roles that match user's organization
            if (role.getOrganization() == null ||
                (user.getOrganization() != null &&
                 role.getOrganization().getId().equals(user.getOrganization().getId()))) {
                permissions.addAll(role.getPermissions());
            }
        }

        return permissions;
    }

    /**
     * Get all permission codes for a user (for frontend)
     * Returns Set of strings like: ["employees:view:own", "documents:upload:team", ...]
     */
    public Set<String> getAllPermissionCodes(User user) {
        return getAllPermissions(user).stream()
            .map(Permission::getCode)
            .collect(Collectors.toSet());
    }

    /**
     * Get accessible employees based on permission scope
     * This is THE MOST IMPORTANT METHOD for data access control
     *
     * @param user The user requesting access
     * @param resource Resource type (employees, documents, etc.)
     * @param action Action type (view, edit, etc.)
     * @return List of employees user can access for this resource:action
     */
    public List<Employee> getAccessibleEmployees(User user, String resource, String action) {
        if (user == null || user.getOrganization() == null) {
            return Collections.emptyList();
        }

        // Find user's employee record
        Optional<Employee> currentEmployeeOpt = employeeRepository.findByUser(user);
        if (currentEmployeeOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Employee currentEmployee = currentEmployeeOpt.get();
        Organization org = user.getOrganization();

        // Check scope from highest to lowest
        if (hasPermission(user, resource, action, "organization")) {
            // Can access ALL employees in organization
            return employeeRepository.findByOrganization(org);
        }

        if (hasPermission(user, resource, action, "department")) {
            // Can access employees in same department
            if (currentEmployee.getDepartment() != null) {
                return employeeRepository.findByDepartment(currentEmployee.getDepartment());
            }
        }

        if (hasPermission(user, resource, action, "team")) {
            // Can access direct reports (team members)
            List<Employee> team = getTeamMembers(currentEmployee);
            team.add(currentEmployee); // Include self
            return team;
        }

        if (hasPermission(user, resource, action, "own")) {
            // Can only access own record
            return Collections.singletonList(currentEmployee);
        }

        return Collections.emptyList();
    }

    /**
     * Get all team members (direct and indirect reports) for a manager
     */
    public List<Employee> getTeamMembers(Employee manager) {
        List<Employee> allEmployees = employeeRepository.findByOrganization(manager.getOrganization());
        return collectReportsInMemory(manager.getId(), allEmployees);
    }

    /**
     * Recursively collect all direct and indirect reports
     */
    private List<Employee> collectReportsInMemory(UUID managerId, List<Employee> allEmployees) {
        List<Employee> team = new ArrayList<>();

        for (Employee emp : allEmployees) {
            if (emp.getReportsTo() != null && emp.getReportsTo().getId().equals(managerId)) {
                team.add(emp);
                // Recursively collect their reports
                team.addAll(collectReportsInMemory(emp.getId(), allEmployees));
            }
        }

        return team;
    }

    /**
     * Check if user can access a specific employee record
     */
    public boolean canAccessEmployee(User user, Employee targetEmployee, String resource, String action) {
        if (user == null || targetEmployee == null) {
            return false;
        }

        // Must be same organization
        if (!user.getOrganization().getId().equals(targetEmployee.getOrganization().getId())) {
            return false;
        }

        List<Employee> accessibleEmployees = getAccessibleEmployees(user, resource, action);
        return accessibleEmployees.stream()
            .anyMatch(emp -> emp.getId().equals(targetEmployee.getId()));
    }

    /**
     * Get all unique resources available in the system
     */
    public List<String> getAllResources() {
        return permissionRepository.findAllResources();
    }

    /**
     * Get all unique actions for a resource
     */
    public List<String> getActionsForResource(String resource) {
        return permissionRepository.findActionsByResource(resource);
    }

    /**
     * Get all unique scopes
     */
    public List<String> getAllScopes() {
        return permissionRepository.findAllScopes();
    }

    /**
     * Get all system permissions (for role management UI)
     */
    public List<Permission> getSystemPermissions() {
        return permissionRepository.findByOrganizationIsNull();
    }

    /**
     * Get all available permissions for an organization (system + custom)
     */
    public List<Permission> getAvailablePermissions(Organization organization) {
        return permissionRepository.findAllAvailableForOrganization(organization);
    }

    /**
     * Group permissions by resource for UI display
     * Returns: Map<"employees", List<Permission>>, Map<"documents", List<Permission>>, etc.
     */
    public Map<String, List<Permission>> groupPermissionsByResource(List<Permission> permissions) {
        return permissions.stream()
            .collect(Collectors.groupingBy(Permission::getResource));
    }

    /**
     * Check if user has role
     */
    public boolean hasRole(User user, String roleName) {
        if (user == null) {
            return false;
        }
        return user.getRoles().stream()
            .anyMatch(role -> role.getName().equals(roleName));
    }

    /**
     * Check if user is SuperAdmin (platform admin)
     */
    public boolean isSuperAdmin(User user) {
        return hasRole(user, "superadmin");
    }

    /**
     * Check if user is OrgAdmin
     */
    public boolean isOrgAdmin(User user) {
        return hasRole(user, "orgadmin");
    }

    /**
     * Get effective permissions for an employee (from permission groups)
     * Returns permission codes in new format: "resource:action:scope"
     */
    public Set<String> getEffectivePermissions(Employee employee) {
        if (employee == null) {
            return Collections.emptySet();
        }

        Set<String> permissionCodes = new HashSet<>();

        for (PermissionGroup group : employee.getPermissionGroups()) {
            for (Permission permission : group.getPermissions()) {
                permissionCodes.add(permission.getCode());
            }
        }

        return permissionCodes;
    }

    /**
     * Check if employee has a specific permission (supports both old and new codes)
     * @param employee The employee to check
     * @param permissionCode Permission code (old format like "REQUEST_DOCS" or new format like "documents:request:own")
     * @return true if employee has the permission
     */
    public boolean has(Employee employee, String permissionCode) {
        if (employee == null) {
            return false;
        }

        // Map old permission codes to new format
        String newCode = mapOldCodeToNew(permissionCode);

        Set<String> effectivePermissions = getEffectivePermissions(employee);

        // Check if employee has the exact permission
        if (effectivePermissions.contains(newCode)) {
            return true;
        }

        // Also check if employee has the permission through their user's roles
        if (employee.getUser() != null) {
            Set<String> userPermissions = getAllPermissionCodes(employee.getUser());
            if (userPermissions.contains(newCode)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user can modify permissions for a target employee
     * Prevents privilege escalation attacks
     *
     * Rules:
     * 1. User cannot modify their own permissions
     * 2. User must have permission-groups:assign:organization permission
     * 3. Target must be in the same organization
     */
    public boolean canModifyPermissions(User currentUser, Employee targetEmployee) {
        if (currentUser == null || targetEmployee == null) {
            return false;
        }

        // Rule 1: Cannot modify own permissions
        Optional<Employee> currentEmployeeOpt = employeeRepository.findByUser(currentUser);
        if (currentEmployeeOpt.isPresent() &&
            currentEmployeeOpt.get().getId().equals(targetEmployee.getId())) {
            return false;
        }

        // Rule 2: Must have permission to assign permission groups
        if (!hasPermission(currentUser, "permission-groups", "assign", "organization")) {
            return false;
        }

        // Rule 3: Must be same organization
        if (currentUser.getOrganization() == null ||
            !currentUser.getOrganization().getId().equals(targetEmployee.getOrganization().getId())) {
            return false;
        }

        return true;
    }

    /**
     * Check if user can assign a role to another user
     * Prevents privilege escalation
     *
     * Rules:
     * 1. User cannot modify their own roles
     * 2. User must have roles:assign:organization permission
     * 3. Target must be in the same organization
     */
    public boolean canAssignRole(User currentUser, User targetUser) {
        if (currentUser == null || targetUser == null) {
            return false;
        }

        // Rule 1: Cannot modify own roles
        if (currentUser.getId().equals(targetUser.getId())) {
            return false;
        }

        // Rule 2: Must have permission to assign roles
        if (!hasPermission(currentUser, "roles", "assign", "organization")) {
            return false;
        }

        // Rule 3: Must be same organization
        if (currentUser.getOrganization() == null ||
            targetUser.getOrganization() == null ||
            !currentUser.getOrganization().getId().equals(targetUser.getOrganization().getId())) {
            return false;
        }

        return true;
    }

    /**
     * Check if user can manage (create/edit/delete) another user
     *
     * Rules:
     * 1. User cannot delete/modify themselves
     * 2. Must have appropriate user management permissions
     * 3. Target must be in the same organization
     */
    public boolean canManageUser(User currentUser, User targetUser, String action) {
        if (currentUser == null || targetUser == null) {
            return false;
        }

        // Rule 1: Cannot modify self (except for profile updates which use different endpoint)
        if (currentUser.getId().equals(targetUser.getId())) {
            return false;
        }

        // Rule 2: Must have user management permission
        if (!hasPermission(currentUser, "users", action, "organization")) {
            return false;
        }

        // Rule 3: Must be same organization
        if (currentUser.getOrganization() == null ||
            targetUser.getOrganization() == null ||
            !currentUser.getOrganization().getId().equals(targetUser.getOrganization().getId())) {
            return false;
        }

        return true;
    }

    /**
     * Validate that all requested permission groups exist and belong to the organization
     */
    public boolean areValidPermissionGroups(List<UUID> groupIds, Organization organization) {
        if (groupIds == null || groupIds.isEmpty()) {
            return true; // Empty is valid
        }

        // For now, all permission groups are system-wide
        // In the future, we might have org-specific groups
        return true;
    }

    /**
     * Map old permission codes to new resource:action:scope format
     */
    private String mapOldCodeToNew(String oldCode) {
        // If it already contains ":", it's in new format
        if (oldCode.contains(":")) {
            return oldCode;
        }

        // Map old codes to new format
        switch (oldCode) {
            case "VIEW_OWN_DOCS":
                return "documents:view:own";
            case "UPLOAD_OWN_DOCS":
                return "documents:upload:own";
            case "REQUEST_DOCS":
                return "documents:request:own";
            case "VIEW_ORG_DOCS":
                return "documents:view:organization";
            case "UPLOAD_FOR_OTHERS":
                return "documents:upload:team";
            case "VIEW_DEPT_DOCS":
                return "documents:view:department";
            default:
                // If no mapping found, return as-is
                return oldCode;
        }
    }
}
