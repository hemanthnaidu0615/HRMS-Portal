package com.hrms.controller;

import com.hrms.dto.DocumentRequestCreateRequest;
import com.hrms.dto.DocumentRequestResponse;
import com.hrms.dto.DocumentRequestStatusUpdateRequest;
import com.hrms.entity.DocumentRequest;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.DocumentRequestService;
import com.hrms.service.EmailService;
import com.hrms.service.EmployeeService;
import com.hrms.service.PermissionService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(DocumentRequestController.class);

    private final DocumentRequestService documentRequestService;
    private final UserService userService;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final PermissionService permissionService;
    private final EmailService emailService;

    public DocumentRequestController(DocumentRequestService documentRequestService,
                                    UserService userService,
                                    EmployeeRepository employeeRepository,
                                    EmployeeService employeeService,
                                    PermissionService permissionService,
                                    EmailService emailService) {
        this.documentRequestService = documentRequestService;
        this.userService = userService;
        this.employeeRepository = employeeRepository;
        this.employeeService = employeeService;
        this.permissionService = permissionService;
        this.emailService = emailService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createRequest(@Valid @RequestBody DocumentRequestCreateRequest request,
                                          Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = getOrCreateEmployee(user);
        Employee targetEmployee = employeeRepository.findById(request.getTargetEmployeeId())
                .orElseThrow(() -> new RuntimeException("Target employee not found"));

        if (user.getOrganization() == null || !user.getOrganization().getId().equals(targetEmployee.getOrganization().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        // Check permission based on scope
        boolean hasPermission = false;
        String highestScope = permissionService.getHighestScope(user, "document-requests", "create");

        if ("organization".equals(highestScope)) {
            hasPermission = true;
        } else if ("department".equals(highestScope)) {
            // Can request from department members
            hasPermission = currentEmployee.getDepartment() != null &&
                           targetEmployee.getDepartment() != null &&
                           currentEmployee.getDepartment().getId().equals(targetEmployee.getDepartment().getId());
        } else if ("team".equals(highestScope)) {
            // Can request from direct reports
            List<Employee> teamMembers = employeeService.getReportingTree(currentEmployee.getId());
            hasPermission = teamMembers.stream().anyMatch(e -> e.getId().equals(targetEmployee.getId()));
        }

        if (!hasPermission) {
            return ResponseEntity.status(403).body(Map.of("error", "You don't have permission to request documents from this employee"));
        }

        DocumentRequest docRequest = documentRequestService.createRequest(user, targetEmployee, request.getMessage());
        DocumentRequestResponse response = toDocumentRequestResponse(docRequest);

        // Send email notification to target employee
        try {
            String requesterName = user.getEmail().split("@")[0]; // Extract name from email
            String targetEmail = targetEmployee.getUser().getEmail();
            emailService.sendDocumentRequestEmail(
                targetEmail,
                requesterName,
                "Document",
                request.getMessage(),
                docRequest.getId().toString()
            );
        } catch (Exception e) {
            logger.error("Failed to send document request email to {}: {}", targetEmployee.getUser().getEmail(), e.getMessage(), e);
            // Don't fail the request - just log the error
        }

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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getOrganizationRequests(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = getOrCreateEmployee(user);

        if (user.getOrganization() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User has no organization"));
        }

        List<DocumentRequest> requests;
        String highestScope = permissionService.getHighestScope(user, "document-requests", "view");

        if ("organization".equals(highestScope)) {
            // Full org access
            requests = documentRequestService.getRequestsForOrganization(user.getOrganization());
        } else if ("department".equals(highestScope)) {
            // Department access only
            if (currentEmployee.getDepartment() == null) {
                return ResponseEntity.status(403).body(Map.of("error", "You are not assigned to a department"));
            }

            requests = documentRequestService.getRequestsForOrganization(user.getOrganization()).stream()
                    .filter(req -> (req.getTargetEmployee().getDepartment() != null &&
                                   req.getTargetEmployee().getDepartment().getId().equals(currentEmployee.getDepartment().getId())) ||
                                  (req.getRequester().getDepartment() != null &&
                                   req.getRequester().getDepartment().getId().equals(currentEmployee.getDepartment().getId())))
                    .collect(Collectors.toList());
        } else if ("team".equals(highestScope)) {
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateRequestStatus(@PathVariable UUID requestId,
                                                 @Valid @RequestBody DocumentRequestStatusUpdateRequest request,
                                                 Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = getOrCreateEmployee(user);
        String highestScope = permissionService.getHighestScope(user, "document-requests", "approve");

        if (highestScope == null) {
            return ResponseEntity.status(403).body(Map.of("error", "You don't have permission to approve/reject document requests"));
        }

        DocumentRequest docRequest = documentRequestService.getRequestsForOrganization(user.getOrganization()).stream()
                .filter(r -> r.getId().equals(requestId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Verify user has permission to approve this specific request based on scope
        boolean hasPermission = false;
        if ("organization".equals(highestScope)) {
            hasPermission = true;
        } else if ("department".equals(highestScope)) {
            hasPermission = currentEmployee.getDepartment() != null &&
                           docRequest.getTargetEmployee().getDepartment() != null &&
                           currentEmployee.getDepartment().getId().equals(docRequest.getTargetEmployee().getDepartment().getId());
        } else if ("team".equals(highestScope)) {
            List<Employee> teamMembers = employeeService.getReportingTree(currentEmployee.getId());
            hasPermission = teamMembers.stream().anyMatch(e -> e.getId().equals(docRequest.getTargetEmployee().getId()));
        }

        if (!hasPermission) {
            return ResponseEntity.status(403).body(Map.of("error", "You don't have permission to approve/reject this request"));
        }

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

        // Get requester employee info
        Employee requesterEmployee = request.getRequester().getEmployee();
        String requesterFirstName = requesterEmployee != null ? requesterEmployee.getFirstName() : null;
        String requesterLastName = requesterEmployee != null ? requesterEmployee.getLastName() : null;

        // Get target employee info
        String targetFirstName = request.getTargetEmployee().getFirstName();
        String targetLastName = request.getTargetEmployee().getLastName();

        return new DocumentRequestResponse(
                request.getId(),
                request.getRequester().getId(),
                request.getRequester().getEmail(),
                requesterFirstName,
                requesterLastName,
                request.getTargetEmployee().getId(),
                request.getTargetEmployee().getUser().getEmail(),
                targetFirstName,
                targetLastName,
                request.getMessage(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getCompletedAt(),
                fulfilledDocId
        );
    }
}
