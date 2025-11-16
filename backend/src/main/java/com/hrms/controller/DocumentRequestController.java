package com.hrms.controller;

import com.hrms.dto.DocumentRequestCreateRequest;
import com.hrms.dto.DocumentRequestResponse;
import com.hrms.dto.DocumentRequestStatusUpdateRequest;
import com.hrms.entity.DocumentRequest;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.DocumentRequestService;
import com.hrms.service.EmployeeService;
import com.hrms.service.PermissionService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/document-requests")
public class DocumentRequestController {

    private final DocumentRequestService documentRequestService;
    private final UserService userService;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final PermissionService permissionService;

    public DocumentRequestController(DocumentRequestService documentRequestService,
                                    UserService userService,
                                    EmployeeRepository employeeRepository,
                                    EmployeeService employeeService,
                                    PermissionService permissionService) {
        this.documentRequestService = documentRequestService;
        this.userService = userService;
        this.employeeRepository = employeeRepository;
        this.employeeService = employeeService;
        this.permissionService = permissionService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createRequest(@Valid @RequestBody DocumentRequestCreateRequest request,
                                          Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = getOrCreateEmployee(user);

        if (!permissionService.has(currentEmployee, "REQUEST_DOCS")) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        Employee targetEmployee = employeeRepository.findById(request.getTargetEmployeeId())
                .orElseThrow(() -> new RuntimeException("Target employee not found"));

        if (user.getOrganization() == null || !user.getOrganization().getId().equals(targetEmployee.getOrganization().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        DocumentRequest docRequest = documentRequestService.createRequest(user, targetEmployee, request.getMessage());
        DocumentRequestResponse response = toDocumentRequestResponse(docRequest);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getRequestsForMe(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee employee = getOrCreateEmployee(user);

        List<DocumentRequest> requests = documentRequestService.getRequestsForEmployee(employee);
        List<DocumentRequestResponse> responses = requests.stream()
                .map(this::toDocumentRequestResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyRequests(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<DocumentRequest> requests = documentRequestService.getRequestsForRequester(user);
        List<DocumentRequestResponse> responses = requests.stream()
                .map(this::toDocumentRequestResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/org")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> getOrganizationRequests(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = getOrCreateEmployee(user);

        if (user.getOrganization() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User has no organization"));
        }

        List<DocumentRequest> requests;

        // Check if user has full org access or only team access
        boolean hasFullOrgAccess = permissionService.has(currentEmployee, "VIEW_ORG_DOCS") ||
                                    permissionService.has(currentEmployee, "UPLOAD_FOR_OTHERS");
        boolean hasTeamAccess = permissionService.has(currentEmployee, "VIEW_DEPT_DOCS");

        if (hasFullOrgAccess) {
            // Full org access (e.g., org admin)
            requests = documentRequestService.getRequestsForOrganization(user.getOrganization());
        } else if (hasTeamAccess) {
            // Team/subtree access only
            List<Employee> teamMembers = employeeService.getReportingTree(currentEmployee.getId());
            teamMembers.add(currentEmployee); // Include self

            List<UUID> teamMemberIds = teamMembers.stream()
                    .map(Employee::getId)
                    .collect(Collectors.toList());

            requests = documentRequestService.getRequestsForOrganization(user.getOrganization()).stream()
                    .filter(req -> teamMemberIds.contains(req.getTargetEmployee().getId()) ||
                                   teamMemberIds.contains(req.getRequester().getId()))
                    .collect(Collectors.toList());
        } else {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        List<DocumentRequestResponse> responses = requests.stream()
                .map(this::toDocumentRequestResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{requestId}/status")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> updateRequestStatus(@PathVariable UUID requestId,
                                                 @Valid @RequestBody DocumentRequestStatusUpdateRequest request,
                                                 Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = getOrCreateEmployee(user);

        if (!permissionService.has(currentEmployee, "UPLOAD_FOR_OTHERS")) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        DocumentRequest docRequest = documentRequestService.getRequestsForOrganization(user.getOrganization()).stream()
                .filter(r -> r.getId().equals(requestId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Request not found or access denied"));

        DocumentRequest updated;
        if ("COMPLETED".equals(request.getStatus())) {
            updated = documentRequestService.markCompleted(docRequest);
        } else if ("REJECTED".equals(request.getStatus())) {
            updated = documentRequestService.markRejected(docRequest);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status. Use COMPLETED or REJECTED"));
        }

        DocumentRequestResponse response = toDocumentRequestResponse(updated);
        return ResponseEntity.ok(response);
    }

    private Employee getOrCreateEmployee(User user) {
        return employeeRepository.findByUser_Id(user.getId())
                .orElseGet(() -> {
                    if (user.getOrganization() == null) {
                        throw new RuntimeException("Employee record not found");
                    }
                    return employeeService.createEmployee(user, user.getOrganization());
                });
    }

    private DocumentRequestResponse toDocumentRequestResponse(DocumentRequest request) {
        UUID fulfilledDocId = request.getFulfilledDocument() != null ?
            request.getFulfilledDocument().getId() : null;

        return new DocumentRequestResponse(
                request.getId(),
                request.getRequester().getId(),
                request.getTargetEmployee().getId(),
                request.getMessage(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getCompletedAt(),
                fulfilledDocId
        );
    }
}
