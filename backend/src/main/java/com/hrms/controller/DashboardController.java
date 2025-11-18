package com.hrms.controller;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.repository.DocumentRepository;
import com.hrms.repository.DocumentRequestRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.OrganizationRepository;
import com.hrms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class DashboardController {

    private final UserService userService;
    private final EmployeeRepository employeeRepository;
    private final DocumentRepository documentRepository;
    private final DocumentRequestRepository documentRequestRepository;
    private final OrganizationRepository organizationRepository;

    @GetMapping("/employee")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getEmployeeDashboard(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee employee = employeeRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Employee record not found"));

        Map<String, Object> stats = new HashMap<>();

        // Document stats
        long myDocuments = documentRepository.findByEmployeeId(employee.getId()).size();
        stats.put("totalDocuments", myDocuments);

        // Document request stats
        long pendingRequests = documentRequestRepository.findByTargetEmployeeId(employee.getId()).stream()
                .filter(req -> "REQUESTED".equals(req.getStatus()))
                .count();
        long completedRequests = documentRequestRepository.findByTargetEmployeeId(employee.getId()).stream()
                .filter(req -> "COMPLETED".equals(req.getStatus()))
                .count();

        stats.put("pendingDocumentRequests", pendingRequests);
        stats.put("completedDocumentRequests", completedRequests);

        // My requests to others
        long myPendingRequests = documentRequestRepository.findByRequesterId(user.getId()).stream()
                .filter(req -> "REQUESTED".equals(req.getStatus()))
                .count();
        stats.put("myPendingRequests", myPendingRequests);

        Map<String, Object> response = new HashMap<>();
        response.put("stats", stats);
        response.put("employeeInfo", Map.of(
                "email", user.getEmail(),
                "department", employee.getDepartment() != null ? employee.getDepartment().getName() : "Not assigned",
                "position", employee.getPosition() != null ? employee.getPosition().getName() : "Not assigned"
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<?> getAdminDashboard(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = user.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        var allEmployees = employeeRepository.findByOrganization(organization);

        Map<String, Object> stats = new HashMap<>();

        // Employee stats
        long totalEmployees = allEmployees.stream()
                .filter(emp -> emp.getDeletedAt() == null)
                .count();
        long activeEmployees = totalEmployees; // Active = not deleted
        long inactiveEmployees = allEmployees.stream()
                .filter(emp -> emp.getDeletedAt() != null)
                .count();

        stats.put("totalEmployees", totalEmployees);
        stats.put("activeEmployees", activeEmployees);
        stats.put("inactiveEmployees", inactiveEmployees);

        // Probation stats
        long onProbation = allEmployees.stream()
                .filter(emp -> emp.getDeletedAt() == null)
                .filter(emp -> Boolean.TRUE.equals(emp.getIsProbation()))
                .count();
        stats.put("onProbation", onProbation);

        // Department stats
        Map<String, Long> departmentStats = allEmployees.stream()
                .filter(emp -> emp.getDeletedAt() == null)
                .filter(emp -> emp.getDepartment() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        emp -> emp.getDepartment().getName(),
                        java.util.stream.Collectors.counting()
                ));
        stats.put("departmentCount", departmentStats.size());
        stats.put("departmentDistribution", departmentStats);

        // Employment type distribution
        Map<String, Long> employmentTypeStats = allEmployees.stream()
                .filter(emp -> emp.getDeletedAt() == null)
                .collect(java.util.stream.Collectors.groupingBy(
                        emp -> emp.getEmploymentType() != null ? emp.getEmploymentType() : "Not Set",
                        java.util.stream.Collectors.counting()
                ));
        stats.put("employmentTypeDistribution", employmentTypeStats);

        // Document stats
        long totalDocuments = documentRepository.findByEmployeeOrganizationId(organization.getId()).size();
        long pendingDocuments = documentRepository.findByEmployeeOrganizationId(organization.getId()).stream()
                .filter(doc -> "PENDING".equals(doc.getApprovalStatus()))
                .count();
        long approvedDocuments = documentRepository.findByEmployeeOrganizationId(organization.getId()).stream()
                .filter(doc -> "APPROVED".equals(doc.getApprovalStatus()))
                .count();

        stats.put("totalDocuments", totalDocuments);
        stats.put("pendingDocuments", pendingDocuments);
        stats.put("approvedDocuments", approvedDocuments);

        // Document request stats
        long pendingRequests = documentRequestRepository.findByTargetEmployeeOrganizationId(organization.getId()).stream()
                .filter(req -> "REQUESTED".equals(req.getStatus()))
                .count();
        long completedRequests = documentRequestRepository.findByTargetEmployeeOrganizationId(organization.getId()).stream()
                .filter(req -> "COMPLETED".equals(req.getStatus()))
                .count();

        stats.put("pendingDocumentRequests", pendingRequests);
        stats.put("completedDocumentRequests", completedRequests);

        // Recent activity (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long newEmployeesLast30Days = allEmployees.stream()
                .filter(emp -> emp.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();
        long newDocumentsLast30Days = documentRepository.findByEmployeeOrganizationId(organization.getId()).stream()
                .filter(doc -> doc.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();

        stats.put("newEmployeesLast30Days", newEmployeesLast30Days);
        stats.put("newDocumentsLast30Days", newDocumentsLast30Days);

        Map<String, Object> response = new HashMap<>();
        response.put("stats", stats);
        response.put("organizationInfo", Map.of(
                "name", organization.getName(),
                "createdAt", organization.getCreatedAt()
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/superadmin")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> getSuperAdminDashboard() {
        Map<String, Object> stats = new HashMap<>();

        // Organization stats
        long totalOrganizations = organizationRepository.findAll().stream()
                .filter(org -> org.getDeletedAt() == null)
                .count();
        long activeOrganizations = organizationRepository.findAll().stream()
                .filter(org -> org.getDeletedAt() == null)
                .count();
        long inactiveOrganizations = organizationRepository.findAll().stream()
                .filter(org -> org.getDeletedAt() != null)
                .count();

        stats.put("totalOrganizations", totalOrganizations);
        stats.put("activeOrganizations", activeOrganizations);
        stats.put("inactiveOrganizations", inactiveOrganizations);

        // Global employee stats
        long totalEmployees = employeeRepository.findAll().stream()
                .filter(emp -> emp.getDeletedAt() == null)
                .count();
        stats.put("totalEmployees", totalEmployees);

        // Recent activity (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long newOrganizationsLast30Days = organizationRepository.findAll().stream()
                .filter(org -> org.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();

        stats.put("newOrganizationsLast30Days", newOrganizationsLast30Days);

        Map<String, Object> response = new HashMap<>();
        response.put("stats", stats);

        return ResponseEntity.ok(response);
    }
}
