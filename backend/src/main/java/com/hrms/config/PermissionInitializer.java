package com.hrms.config;

import com.hrms.entity.Permission;
import com.hrms.entity.PermissionGroup;
import com.hrms.repository.PermissionGroupRepository;
import com.hrms.repository.PermissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Component
@Order(1)
public class PermissionInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PermissionInitializer.class);

    private final PermissionRepository permissionRepository;
    private final PermissionGroupRepository permissionGroupRepository;

    public PermissionInitializer(PermissionRepository permissionRepository,
                                PermissionGroupRepository permissionGroupRepository) {
        this.permissionRepository = permissionRepository;
        this.permissionGroupRepository = permissionGroupRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        initializePermissions();
        initializeGroups();
    }

    private void initializePermissions() {
        // Format: resource, action, scope, description
        List<String[]> permissions = Arrays.asList(
            // =====================================================
            // EMPLOYEES permissions
            // =====================================================
            new String[]{"employees", "view", "own", "View own employee profile"},
            new String[]{"employees", "view", "team", "View direct reports"},
            new String[]{"employees", "view", "department", "View department employees"},
            new String[]{"employees", "view", "organization", "View all employees in organization"},

            new String[]{"employees", "edit", "own", "Edit own employee profile"},
            new String[]{"employees", "edit", "team", "Edit direct reports"},
            new String[]{"employees", "edit", "department", "Edit department employees"},
            new String[]{"employees", "edit", "organization", "Edit all employees"},

            new String[]{"employees", "create", "organization", "Create new employees"},
            new String[]{"employees", "delete", "organization", "Delete employees"},

            new String[]{"probation", "view", "team", "View probation status of direct reports"},
            new String[]{"probation", "view", "department", "View probation status of department employees"},
            new String[]{"probation", "view", "organization", "View all employee probation status"},
            new String[]{"probation", "manage", "team", "Manage probation periods for direct reports"},
            new String[]{"probation", "manage", "department", "Manage probation periods for department"},
            new String[]{"probation", "manage", "organization", "Manage all probation periods (extend, complete, terminate)"},

            // =====================================================
            // DOCUMENTS permissions
            // =====================================================
            new String[]{"documents", "view", "own", "View own documents"},
            new String[]{"documents", "view", "team", "View team documents"},
            new String[]{"documents", "view", "department", "View department documents"},
            new String[]{"documents", "view", "organization", "View all organization documents"},

            new String[]{"documents", "upload", "own", "Upload own documents"},
            new String[]{"documents", "upload", "team", "Upload documents for team members"},
            new String[]{"documents", "upload", "organization", "Upload documents for any employee"},

            new String[]{"documents", "delete", "own", "Delete own documents"},
            new String[]{"documents", "delete", "organization", "Delete any documents"},

            new String[]{"documents", "approve", "organization", "Approve/reject document submissions"},

            // =====================================================
            // DOCUMENT REQUESTS permissions
            // =====================================================
            new String[]{"document-requests", "create", "team", "Request documents from direct reports"},
            new String[]{"document-requests", "create", "department", "Request documents from department members"},
            new String[]{"document-requests", "create", "organization", "Request documents from anyone"},

            new String[]{"document-requests", "view", "own", "View requests you created or received"},
            new String[]{"document-requests", "view", "team", "View team document requests"},
            new String[]{"document-requests", "view", "department", "View department document requests"},
            new String[]{"document-requests", "view", "organization", "View all document requests"},

            new String[]{"document-requests", "approve", "team", "Approve/reject team document requests"},
            new String[]{"document-requests", "approve", "department", "Approve/reject department document requests"},
            new String[]{"document-requests", "approve", "organization", "Approve/reject any document requests"},

            // =====================================================
            // DEPARTMENTS & POSITIONS permissions
            // =====================================================
            new String[]{"departments", "view", "organization", "View all departments"},
            new String[]{"departments", "create", "organization", "Create departments"},
            new String[]{"departments", "edit", "organization", "Edit departments"},
            new String[]{"departments", "delete", "organization", "Delete departments"},

            new String[]{"positions", "view", "organization", "View all positions"},
            new String[]{"positions", "create", "organization", "Create positions"},
            new String[]{"positions", "edit", "organization", "Edit positions"},
            new String[]{"positions", "delete", "organization", "Delete positions"},

            // =====================================================
            // ROLES & PERMISSIONS management
            // =====================================================
            new String[]{"roles", "view", "organization", "View organization roles"},
            new String[]{"roles", "create", "organization", "Create custom roles"},
            new String[]{"roles", "edit", "organization", "Edit roles"},
            new String[]{"roles", "delete", "organization", "Delete roles"},
            new String[]{"roles", "assign", "organization", "Assign roles to users"},

            new String[]{"permissions", "view", "organization", "View all permissions"},
            new String[]{"permissions", "grant", "organization", "Grant permissions to employees"},
            new String[]{"permissions", "revoke", "organization", "Revoke permissions from employees"},

            new String[]{"permission-groups", "view", "organization", "View permission groups"},
            new String[]{"permission-groups", "assign", "organization", "Assign permission groups to employees"},
            new String[]{"permission-groups", "revoke", "organization", "Revoke permission groups from employees"},

            // =====================================================
            // USERS management
            // =====================================================
            new String[]{"users", "view", "organization", "View organization users"},
            new String[]{"users", "create", "organization", "Create new users"},
            new String[]{"users", "edit", "organization", "Edit user accounts"},
            new String[]{"users", "delete", "organization", "Delete user accounts"},
            new String[]{"users", "reset-password", "organization", "Reset user passwords"},

            // =====================================================
            // ORGANIZATION management
            // =====================================================
            new String[]{"organization", "view", "organization", "View organization details"},
            new String[]{"organization", "edit", "organization", "Edit organization settings"},

            // =====================================================
            // AUDIT & LOGS
            // =====================================================
            new String[]{"audit-logs", "view", "organization", "View organization audit logs"},
            new String[]{"email-logs", "view", "organization", "View email logs"},

            // =====================================================
            // FUTURE: Leave management permissions
            // =====================================================
            new String[]{"leaves", "create", "own", "Request own leave"},
            new String[]{"leaves", "view", "own", "View own leave requests"},
            new String[]{"leaves", "view", "team", "View team leave requests"},
            new String[]{"leaves", "view", "department", "View department leave requests"},
            new String[]{"leaves", "view", "organization", "View all leave requests"},
            new String[]{"leaves", "approve", "team", "Approve team leave requests"},
            new String[]{"leaves", "approve", "department", "Approve department leave requests"},
            new String[]{"leaves", "approve", "organization", "Approve all leave requests"},
            new String[]{"leaves", "cancel", "own", "Cancel own leave requests"},

            // =====================================================
            // FUTURE: Timesheet permissions
            // =====================================================
            new String[]{"timesheets", "submit", "own", "Submit own timesheet"},
            new String[]{"timesheets", "view", "own", "View own timesheets"},
            new String[]{"timesheets", "view", "team", "View team timesheets"},
            new String[]{"timesheets", "view", "department", "View department timesheets"},
            new String[]{"timesheets", "view", "organization", "View all timesheets"},
            new String[]{"timesheets", "approve", "team", "Approve team timesheets"},
            new String[]{"timesheets", "approve", "department", "Approve department timesheets"},

            // =====================================================
            // FUTURE: Payroll permissions
            // =====================================================
            new String[]{"payroll", "view", "own", "View own payroll information"},
            new String[]{"payroll", "view", "team", "View team payroll"},
            new String[]{"payroll", "view", "organization", "View all payroll"},
            new String[]{"payroll", "run", "organization", "Run payroll processing"},
            new String[]{"payroll", "approve", "organization", "Approve payroll runs"}
        );

        for (String[] perm : permissions) {
            if (permissionRepository.findByResourceAndActionAndScopeAndOrganizationIsNull(
                    perm[0], perm[1], perm[2]).isEmpty()) {
                Permission permission = new Permission(perm[0], perm[1], perm[2], perm[3]);
                permissionRepository.save(permission);
                log.debug("Created permission: {}:{}:{}", perm[0], perm[1], perm[2]);
            }
        }

        log.info("Initialized {} permissions", permissions.size());
    }

    private void initializeGroups() {
        // Basic employee permissions
        Permission viewOwnEmployee = getPermission("employees", "view", "own");
        Permission editOwnEmployee = getPermission("employees", "edit", "own");
        Permission viewOwnDocs = getPermission("documents", "view", "own");
        Permission uploadOwnDocs = getPermission("documents", "upload", "own");
        Permission viewOwnDocRequests = getPermission("document-requests", "view", "own");
        Permission createOwnLeave = getPermission("leaves", "create", "own");
        Permission viewOwnLeave = getPermission("leaves", "view", "own");
        Permission submitOwnTimesheet = getPermission("timesheets", "submit", "own");
        Permission viewOwnTimesheet = getPermission("timesheets", "view", "own");
        Permission viewOwnPayroll = getPermission("payroll", "view", "own");

        if (permissionGroupRepository.findByName("EMPLOYEE_BASIC").isEmpty()) {
            PermissionGroup employeeBasic = new PermissionGroup("EMPLOYEE_BASIC", "Basic employee permissions");
            employeeBasic.setPermissions(new HashSet<>(Arrays.asList(
                viewOwnEmployee, editOwnEmployee, viewOwnDocs, uploadOwnDocs, viewOwnDocRequests,
                createOwnLeave, viewOwnLeave, submitOwnTimesheet, viewOwnTimesheet, viewOwnPayroll
            )));
            permissionGroupRepository.save(employeeBasic);
            log.info("Created EMPLOYEE_BASIC permission group");
        }

        // Department/HR level permissions
        Permission viewDeptEmployees = getPermission("employees", "view", "department");
        Permission editDeptEmployees = getPermission("employees", "edit", "department");
        Permission viewDeptDocs = getPermission("documents", "view", "department");
        Permission uploadTeamDocs = getPermission("documents", "upload", "team");
        Permission createDeptDocRequests = getPermission("document-requests", "create", "department");
        Permission viewDeptDocRequests = getPermission("document-requests", "view", "department");
        Permission approveDeptDocRequests = getPermission("document-requests", "approve", "department");
        Permission viewDeptLeaves = getPermission("leaves", "view", "department");
        Permission approveDeptLeaves = getPermission("leaves", "approve", "department");
        Permission viewDeptTimesheets = getPermission("timesheets", "view", "department");
        Permission approveDeptTimesheets = getPermission("timesheets", "approve", "department");

        if (permissionGroupRepository.findByName("ORG_HR").isEmpty()) {
            PermissionGroup orgHr = new PermissionGroup("ORG_HR", "HR permissions for department management");
            orgHr.setPermissions(new HashSet<>(Arrays.asList(
                viewOwnEmployee, editOwnEmployee, viewOwnDocs, uploadOwnDocs, viewOwnDocRequests,
                viewDeptEmployees, editDeptEmployees, viewDeptDocs, uploadTeamDocs,
                createDeptDocRequests, viewDeptDocRequests, approveDeptDocRequests,
                viewDeptLeaves, approveDeptLeaves, viewDeptTimesheets, approveDeptTimesheets
            )));
            permissionGroupRepository.save(orgHr);
            log.info("Created ORG_HR permission group");
        }

        // Organization admin - ALL organization-scoped permissions
        if (permissionGroupRepository.findByName("ORG_ADMIN_FULL").isEmpty()) {
            PermissionGroup orgAdminFull = new PermissionGroup("ORG_ADMIN_FULL", "Full organization admin permissions - complete system access");

            // Get ALL permissions with scope='organization'
            List<Permission> allOrgPermissions = permissionRepository.findAll().stream()
                .filter(p -> "organization".equals(p.getScope()) && p.getOrganization() == null)
                .toList();

            // Also include basic "own" permissions for the admin themselves
            List<Permission> basicOwnPermissions = permissionRepository.findAll().stream()
                .filter(p -> "own".equals(p.getScope()) && p.getOrganization() == null)
                .toList();

            HashSet<Permission> adminPermissions = new HashSet<>();
            adminPermissions.addAll(allOrgPermissions);
            adminPermissions.addAll(basicOwnPermissions);

            orgAdminFull.setPermissions(adminPermissions);
            permissionGroupRepository.save(orgAdminFull);
            log.info("Created ORG_ADMIN_FULL permission group with {} permissions", adminPermissions.size());
        }

        log.info("Permission groups initialized");
    }

    private Permission getPermission(String resource, String action, String scope) {
        return permissionRepository.findByResourceAndActionAndScopeAndOrganizationIsNull(
                resource, action, scope)
                .orElseThrow(() -> new RuntimeException(
                    String.format("Permission not found: %s:%s:%s", resource, action, scope)));
    }
}
