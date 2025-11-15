package com.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeHistoryResponse {
    private UUID id;
    private String changedField;
    private String oldValue;
    private String newValue;
    private LocalDateTime changedAt;
    private String changedByEmail;
}
