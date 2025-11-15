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
        List<String[]> permissions = Arrays.asList(
            new String[]{"VIEW_OWN_DOCS", "View own documents"},
            new String[]{"UPLOAD_OWN_DOCS", "Upload own documents"},
            new String[]{"REQUEST_DOCS", "Request documents from others"},
            new String[]{"VIEW_ORG_DOCS", "View organization documents"},
            new String[]{"UPLOAD_FOR_OTHERS", "Upload documents for others"},
            new String[]{"VIEW_DEPT_DOCS", "View department documents"}
        );

        for (String[] perm : permissions) {
            if (permissionRepository.findByCode(perm[0]).isEmpty()) {
                Permission permission = new Permission(perm[0], perm[1]);
                permissionRepository.save(permission);
            }
        }
    }

    private void initializeGroups() {
        Permission viewOwn = permissionRepository.findByCode("VIEW_OWN_DOCS").orElseThrow();
        Permission uploadOwn = permissionRepository.findByCode("UPLOAD_OWN_DOCS").orElseThrow();
        Permission requestDocs = permissionRepository.findByCode("REQUEST_DOCS").orElseThrow();
        Permission viewOrg = permissionRepository.findByCode("VIEW_ORG_DOCS").orElseThrow();
        Permission uploadForOthers = permissionRepository.findByCode("UPLOAD_FOR_OTHERS").orElseThrow();
        Permission viewDept = permissionRepository.findByCode("VIEW_DEPT_DOCS").orElseThrow();

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
