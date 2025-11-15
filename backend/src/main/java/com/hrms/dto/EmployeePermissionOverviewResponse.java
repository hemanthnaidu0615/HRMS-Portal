package com.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePermissionOverviewResponse {
    private UUID employeeId;
    private String email;
    private List<EmployeePermissionGroupResponse> assignedGroups;
    private Set<String> effectivePermissions;
}
