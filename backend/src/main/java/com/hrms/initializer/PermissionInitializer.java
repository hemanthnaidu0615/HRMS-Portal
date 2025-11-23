package com.hrms.initializer;

import com.hrms.entity.Permission;
import com.hrms.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.ArrayList;
import java.util.List;

/**
 * Initializes standard permissions on application startup
 * Creates a comprehensive set of permissions with clear descriptions
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class PermissionInitializer {

    private final PermissionRepository permissionRepository;

    @Bean
    @Order(1)
    public CommandLineRunner initializePermissions() {
        return args -> {
            log.info("Initializing standard permissions...");

            List<PermissionDefinition> definitions = new ArrayList<>();

            // Employee Management Permissions
            definitions.add(new PermissionDefinition(
                "employees", "view", "own",
                "View My Own Profile",
                "Can view and access their own employee profile and information"
            ));
            definitions.add(new PermissionDefinition(
                "employees", "view", "team",
                "View Team Members",
                "Can view profiles of direct reports and team members"
            ));
            definitions.add(new PermissionDefinition(
                "employees", "view", "department",
                "View Department Employees",
                "Can view all employees in their department"
            ));
            definitions.add(new PermissionDefinition(
                "employees", "view", "organization",
                "View All Employees",
                "Can view all employees across the entire organization"
            ));

            definitions.add(new PermissionDefinition(
                "employees", "create", "organization",
                "Create New Employees",
                "Can create and onboard new employees into the organization"
            ));
            definitions.add(new PermissionDefinition(
                "employees", "edit", "own",
                "Edit My Own Profile",
                "Can update their own personal information and profile"
            ));
            definitions.add(new PermissionDefinition(
                "employees", "edit", "team",
                "Edit Team Member Profiles",
                "Can update information for direct reports and team members"
            ));
            definitions.add(new PermissionDefinition(
                "employees", "edit", "department",
                "Edit Department Employee Profiles",
                "Can update information for all employees in their department"
            ));
            definitions.add(new PermissionDefinition(
                "employees", "edit", "organization",
                "Edit All Employee Profiles",
                "Can update information for any employee in the organization"
            ));

            // Payroll Permissions
            definitions.add(new PermissionDefinition(
                "payroll", "view", "own",
                "View My Payroll",
                "Can view their own salary, payslips, and compensation details"
            ));
            definitions.add(new PermissionDefinition(
                "payroll", "view", "team",
                "View Team Payroll",
                "Can view salary and payroll information for their team members"
            ));
            definitions.add(new PermissionDefinition(
                "payroll", "view", "department",
                "View Department Payroll",
                "Can view payroll information for all employees in their department"
            ));
            definitions.add(new PermissionDefinition(
                "payroll", "view", "organization",
                "View All Payroll",
                "Can view payroll information for the entire organization"
            ));

            definitions.add(new PermissionDefinition(
                "payroll", "edit", "team",
                "Edit Team Payroll",
                "Can modify salary and compensation for team members"
            ));
            definitions.add(new PermissionDefinition(
                "payroll", "edit", "department",
                "Edit Department Payroll",
                "Can modify payroll for all employees in their department"
            ));
            definitions.add(new PermissionDefinition(
                "payroll", "edit", "organization",
                "Edit All Payroll",
                "Can modify payroll for any employee in the organization"
            ));

            // Timesheet Permissions
            definitions.add(new PermissionDefinition(
                "timesheet", "view", "own",
                "View My Timesheet",
                "Can view and track their own time entries and hours worked"
            ));
            definitions.add(new PermissionDefinition(
                "timesheet", "view", "team",
                "View Team Timesheets",
                "Can view time entries and hours for their team members"
            ));
            definitions.add(new PermissionDefinition(
                "timesheet", "view", "department",
                "View Department Timesheets",
                "Can view timesheets for all employees in their department"
            ));
            definitions.add(new PermissionDefinition(
                "timesheet", "view", "organization",
                "View All Timesheets",
                "Can view timesheets across the entire organization"
            ));

            definitions.add(new PermissionDefinition(
                "timesheet", "edit", "own",
                "Edit My Timesheet",
                "Can create and modify their own time entries"
            ));
            definitions.add(new PermissionDefinition(
                "timesheet", "edit", "team",
                "Edit Team Timesheets",
                "Can modify time entries for team members"
            ));
            definitions.add(new PermissionDefinition(
                "timesheet", "edit", "department",
                "Edit Department Timesheets",
                "Can modify timesheets for all employees in their department"
            ));
            definitions.add(new PermissionDefinition(
                "timesheet", "edit", "organization",
                "Edit All Timesheets",
                "Can modify any timesheet in the organization"
            ));

            // Leave Management Permissions
            definitions.add(new PermissionDefinition(
                "leave", "view", "own",
                "View My Leave",
                "Can view their own leave balance and leave requests"
            ));
            definitions.add(new PermissionDefinition(
                "leave", "view", "team",
                "View Team Leave",
                "Can view leave requests and balances for team members"
            ));
            definitions.add(new PermissionDefinition(
                "leave", "view", "department",
                "View Department Leave",
                "Can view leave information for all employees in their department"
            ));
            definitions.add(new PermissionDefinition(
                "leave", "view", "organization",
                "View All Leave",
                "Can view leave information across the entire organization"
            ));

            definitions.add(new PermissionDefinition(
                "leave", "approve", "team",
                "Approve Team Leave",
                "Can approve or reject leave requests from team members"
            ));
            definitions.add(new PermissionDefinition(
                "leave", "approve", "department",
                "Approve Department Leave",
                "Can approve or reject leave requests from their department"
            ));
            definitions.add(new PermissionDefinition(
                "leave", "approve", "organization",
                "Approve All Leave",
                "Can approve or reject any leave request in the organization"
            ));

            // Document Permissions
            definitions.add(new PermissionDefinition(
                "documents", "view", "own",
                "View My Documents",
                "Can view and download their own documents"
            ));
            definitions.add(new PermissionDefinition(
                "documents", "view", "team",
                "View Team Documents",
                "Can access documents of team members"
            ));
            definitions.add(new PermissionDefinition(
                "documents", "view", "department",
                "View Department Documents",
                "Can access documents of all employees in their department"
            ));
            definitions.add(new PermissionDefinition(
                "documents", "view", "organization",
                "View All Documents",
                "Can access any document in the organization"
            ));

            definitions.add(new PermissionDefinition(
                "documents", "upload", "own",
                "Upload My Documents",
                "Can upload personal documents"
            ));
            definitions.add(new PermissionDefinition(
                "documents", "upload", "organization",
                "Upload Organization Documents",
                "Can upload documents for any employee"
            ));

            definitions.add(new PermissionDefinition(
                "documents", "sign", "organization",
                "Send Documents for Signature",
                "Can send documents to employees for e-signature"
            ));

            // Department & Structure Permissions
            definitions.add(new PermissionDefinition(
                "departments", "view", "organization",
                "View Departments",
                "Can view all departments and organizational structure"
            ));
            definitions.add(new PermissionDefinition(
                "departments", "manage", "organization",
                "Manage Departments",
                "Can create, edit, and delete departments"
            ));

            definitions.add(new PermissionDefinition(
                "positions", "view", "organization",
                "View Positions",
                "Can view all job positions and titles"
            ));
            definitions.add(new PermissionDefinition(
                "positions", "manage", "organization",
                "Manage Positions",
                "Can create, edit, and delete job positions"
            ));

            // Role & Permission Management
            definitions.add(new PermissionDefinition(
                "roles", "view", "organization",
                "View Roles",
                "Can view all roles and their permissions"
            ));
            definitions.add(new PermissionDefinition(
                "roles", "manage", "organization",
                "Manage Roles",
                "Can create, edit, and delete roles and assign permissions"
            ));

            definitions.add(new PermissionDefinition(
                "permissions", "assign", "organization",
                "Assign Permissions",
                "Can assign permissions and roles to employees"
            ));

            // Attendance Permissions
            definitions.add(new PermissionDefinition(
                "attendance", "view", "own",
                "View My Attendance",
                "Can view their own attendance records"
            ));
            definitions.add(new PermissionDefinition(
                "attendance", "view", "team",
                "View Team Attendance",
                "Can view attendance records for team members"
            ));
            definitions.add(new PermissionDefinition(
                "attendance", "view", "department",
                "View Department Attendance",
                "Can view attendance for all employees in their department"
            ));
            definitions.add(new PermissionDefinition(
                "attendance", "view", "organization",
                "View All Attendance",
                "Can view attendance across the entire organization"
            ));

            // Performance Management Permissions
            definitions.add(new PermissionDefinition(
                "performance", "view", "own",
                "View My Performance",
                "Can view their own performance reviews and goals"
            ));
            definitions.add(new PermissionDefinition(
                "performance", "view", "team",
                "View Team Performance",
                "Can view performance reviews and goals for team members"
            ));
            definitions.add(new PermissionDefinition(
                "performance", "manage", "team",
                "Manage Team Performance",
                "Can create and manage performance reviews for team members"
            ));
            definitions.add(new PermissionDefinition(
                "performance", "manage", "department",
                "Manage Department Performance",
                "Can manage performance reviews for all employees in their department"
            ));

            // Recruitment Permissions
            definitions.add(new PermissionDefinition(
                "recruitment", "view", "organization",
                "View Job Postings",
                "Can view all job postings and applications"
            ));
            definitions.add(new PermissionDefinition(
                "recruitment", "manage", "organization",
                "Manage Recruitment",
                "Can create job postings, review applications, and schedule interviews"
            ));

            // Assets Permissions
            definitions.add(new PermissionDefinition(
                "assets", "view", "own",
                "View My Assets",
                "Can view assets assigned to them"
            ));
            definitions.add(new PermissionDefinition(
                "assets", "view", "organization",
                "View All Assets",
                "Can view all organizational assets"
            ));
            definitions.add(new PermissionDefinition(
                "assets", "manage", "organization",
                "Manage Assets",
                "Can create, assign, and manage organizational assets"
            ));

            // Reports Permissions
            definitions.add(new PermissionDefinition(
                "reports", "view", "organization",
                "View Reports",
                "Can view and generate organizational reports"
            ));

            // Create permissions
            int createdCount = 0;
            for (PermissionDefinition def : definitions) {
                try {
                    if (!permissionRepository.existsByResourceAndActionAndScope(
                            def.resource, def.action, def.scope)) {

                        Permission permission = new Permission();
                        permission.setResource(def.resource);
                        permission.setAction(def.action);
                        permission.setScope(def.scope);
                        permission.setDescription(def.description);
                        permission.setFriendlyName(def.friendlyName);
                        permission.setOrganization(null); // Global permissions

                        permissionRepository.save(permission);
                        createdCount++;
                    }
                } catch (Exception e) {
                    log.warn("Could not create permission {}.{}.{}: {}",
                        def.resource, def.action, def.scope, e.getMessage());
                }
            }

            log.info("✓ Permissions initialized: {} new permissions created", createdCount);
        };
    }

    private static class PermissionDefinition {
        String resource;
        String action;
        String scope;
        String friendlyName;
        String description;

        PermissionDefinition(String resource, String action, String scope,
                           String friendlyName, String description) {
            this.resource = resource;
            this.action = action;
            this.scope = scope;
            this.friendlyName = friendlyName;
            this.description = description;
        }
    }
}
