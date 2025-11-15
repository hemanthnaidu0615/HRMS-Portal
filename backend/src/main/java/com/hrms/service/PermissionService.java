package com.hrms.service;

import com.hrms.entity.Employee;
import com.hrms.entity.Permission;
import com.hrms.entity.PermissionGroup;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class PermissionService {

    public boolean has(Employee employee, String permissionCode) {
        return getEffectivePermissions(employee).contains(permissionCode);
    }

    public Set<String> getEffectivePermissions(Employee employee) {
        Set<String> permissions = new HashSet<>();

        for (PermissionGroup group : employee.getPermissionGroups()) {
            for (Permission permission : group.getPermissions()) {
                permissions.add(permission.getCode());
            }
        }

        return permissions;
    }
}
