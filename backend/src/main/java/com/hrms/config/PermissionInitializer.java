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
            new String[]{"documents", "view", "own", "View own documents"},
            new String[]{"documents", "upload", "own", "Upload own documents"},
            new String[]{"documents", "request", "own", "Request documents from others"},
            new String[]{"documents", "view", "organization", "View organization documents"},
            new String[]{"documents", "upload", "team", "Upload documents for others"},
            new String[]{"documents", "view", "department", "View department documents"}
        );

        for (String[] perm : permissions) {
            if (permissionRepository.findByResourceAndActionAndScopeAndOrganizationIsNull(
                    perm[0], perm[1], perm[2]).isEmpty()) {
                Permission permission = new Permission(perm[0], perm[1], perm[2], perm[3]);
                permissionRepository.save(permission);
            }
        }
    }

    private void initializeGroups() {
        Permission viewOwn = permissionRepository.findByResourceAndActionAndScopeAndOrganizationIsNull(
                "documents", "view", "own").orElseThrow();
        Permission uploadOwn = permissionRepository.findByResourceAndActionAndScopeAndOrganizationIsNull(
                "documents", "upload", "own").orElseThrow();
        Permission requestDocs = permissionRepository.findByResourceAndActionAndScopeAndOrganizationIsNull(
                "documents", "request", "own").orElseThrow();
        Permission viewOrg = permissionRepository.findByResourceAndActionAndScopeAndOrganizationIsNull(
                "documents", "view", "organization").orElseThrow();
        Permission uploadForOthers = permissionRepository.findByResourceAndActionAndScopeAndOrganizationIsNull(
                "documents", "upload", "team").orElseThrow();
        Permission viewDept = permissionRepository.findByResourceAndActionAndScopeAndOrganizationIsNull(
                "documents", "view", "department").orElseThrow();

        if (permissionGroupRepository.findByName("EMPLOYEE_BASIC").isEmpty()) {
            PermissionGroup employeeBasic = new PermissionGroup("EMPLOYEE_BASIC", "Basic employee permissions");
            employeeBasic.setPermissions(new HashSet<>(Arrays.asList(viewOwn, uploadOwn, requestDocs)));
            permissionGroupRepository.save(employeeBasic);
        }

        if (permissionGroupRepository.findByName("ORG_HR").isEmpty()) {
            PermissionGroup orgHr = new PermissionGroup("ORG_HR", "HR permissions");
            orgHr.setPermissions(new HashSet<>(Arrays.asList(viewOwn, uploadOwn, requestDocs, viewDept, uploadForOthers)));
            permissionGroupRepository.save(orgHr);
        }

        if (permissionGroupRepository.findByName("ORG_ADMIN_FULL").isEmpty()) {
            PermissionGroup orgAdminFull = new PermissionGroup("ORG_ADMIN_FULL", "Full organization admin permissions");
            orgAdminFull.setPermissions(new HashSet<>(Arrays.asList(viewOwn, uploadOwn, requestDocs, viewOrg, uploadForOthers)));
            permissionGroupRepository.save(orgAdminFull);
        }

        log.info("Permission groups initialized");
    }
}
