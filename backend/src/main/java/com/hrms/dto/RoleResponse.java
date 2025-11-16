package com.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RoleResponse {
    private Integer id;
    private String name;
    private String description;
    private boolean systemRole;
    private LocalDateTime createdAt;
}
