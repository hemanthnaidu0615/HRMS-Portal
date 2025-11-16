package com.hrms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class EmployeeRoleUpdateRequest {
    @NotNull(message = "Role IDs are required")
    private List<Integer> roleIds;
}
