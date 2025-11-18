package com.hrms.dto.permissions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePermissionsResponse {
    private UUID employeeId;
    private String email;
    private String firstName;
    private String lastName;
    private List<ResourcePermission> permissions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourcePermission {
        private String resource;        // employees, documents, departments
        private String label;           // Employees, Documents, Organization Structure
        private String description;     // Human-readable description
        private boolean canViewOwn;
        private boolean canEditOwn;
        private boolean canViewTeam;
        private boolean canEditTeam;
        private boolean canViewOrg;
        private boolean canEditOrg;
    }
}
