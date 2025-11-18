package com.hrms.controller;

import com.hrms.dto.permissions.EmployeePermissionsRequest;
import com.hrms.dto.permissions.EmployeePermissionsResponse;
import com.hrms.service.SimplePermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class SimplePermissionsController {

    private final SimplePermissionService permissionService;

    /**
     * Get employee's current permissions in simple format
     */
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<EmployeePermissionsResponse> getEmployeePermissions(
            @PathVariable UUID employeeId
    ) {
        EmployeePermissionsResponse permissions = permissionService.getEmployeeSimplePermissions(employeeId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * Update employee permissions using simple model
     */
    @PutMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<EmployeePermissionsResponse> updateEmployeePermissions(
            @PathVariable UUID employeeId,
            @RequestBody EmployeePermissionsRequest request,
            Authentication authentication
    ) {
        EmployeePermissionsResponse updated = permissionService.updateEmployeeSimplePermissions(
                employeeId,
                request,
                authentication.getName()
        );
        return ResponseEntity.ok(updated);
    }

    /**
     * Get my own permissions
     */
    @GetMapping("/me")
    public ResponseEntity<EmployeePermissionsResponse> getMyPermissions(
            Authentication authentication
    ) {
        EmployeePermissionsResponse permissions = permissionService.getMySimplePermissions(
                authentication.getName()
        );
        return ResponseEntity.ok(permissions);
    }
}
