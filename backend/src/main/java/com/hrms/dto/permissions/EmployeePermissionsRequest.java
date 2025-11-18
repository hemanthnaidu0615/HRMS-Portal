package com.hrms.dto.permissions;

import lombok.Data;

import java.util.List;

@Data
public class EmployeePermissionsRequest {
    private List<ResourcePermission> permissions;

    @Data
    public static class ResourcePermission {
        private String resource;        // employees, documents, departments
        private boolean canViewOwn;
        private boolean canEditOwn;
        private boolean canViewTeam;
        private boolean canEditTeam;
        private boolean canViewOrg;
        private boolean canEditOrg;
    }
}
