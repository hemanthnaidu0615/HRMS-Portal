package com.hrms.controller;

import com.hrms.dto.CreateEmployeeRequest;
import com.hrms.entity.User;
import com.hrms.repository.UserRepository;
import com.hrms.service.EmailService;
import com.hrms.service.EmployeeService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orgadmin")
@PreAuthorize("hasRole('ORGADMIN')")
public class OrgAdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final EmployeeService employeeService;

    public OrgAdminController(UserService userService, UserRepository userRepository, EmailService emailService, EmployeeService employeeService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.employeeService = employeeService;
    }

    @PostMapping("/employees")
    public ResponseEntity<?> createEmployee(@Valid @RequestBody CreateEmployeeRequest request,
                                           Authentication authentication) {
        String orgAdminEmail = authentication.getName();
        User orgAdmin = userService.findByEmail(orgAdminEmail)
                .orElseThrow(() -> new RuntimeException("Organization admin not found"));

        if (orgAdmin.getOrganization() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Organization admin has no organization"));
        }

        if (userService.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        User employee = userService.createEmployee(
                request.getEmail(),
                request.getTemporaryPassword(),
                orgAdmin.getOrganization()
        );

        employeeService.createEmployee(employee, orgAdmin.getOrganization());

        // Send email with temporary password
        try {
            emailService.sendTemporaryPasswordEmail(request.getEmail(), request.getTemporaryPassword());
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Failed to send email: " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", employee.getId());
        response.put("email", employee.getEmail());
        response.put("organizationId", employee.getOrganization().getId());
        response.put("mustChangePassword", employee.isMustChangePassword());

        return ResponseEntity.ok(response);
    }

    // REMOVED: Duplicate endpoint GET /api/orgadmin/employees
    // Conflicted with EmployeeManagementController - use that endpoint instead
}
