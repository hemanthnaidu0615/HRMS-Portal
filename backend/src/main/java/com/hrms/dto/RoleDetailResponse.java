package com.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class RoleDetailResponse {
    private Integer id;
    private String name;
    private String description;
    private boolean systemRole;
    private LocalDateTime createdAt;
    private List<PermissionResponse> permissions;
}
