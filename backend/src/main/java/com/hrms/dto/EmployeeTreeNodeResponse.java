package com.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeTreeNodeResponse {
    private UUID employeeId;
    private String email;
    private String positionName;
    private String departmentName;
    private List<EmployeeTreeNodeResponse> reports = new ArrayList<>();
}
