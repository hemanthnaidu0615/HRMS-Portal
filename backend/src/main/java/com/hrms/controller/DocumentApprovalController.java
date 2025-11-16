package com.hrms.controller;

import com.hrms.entity.Document;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.repository.DocumentRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.PermissionService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ORGADMIN')")
public class DocumentApprovalController {

    private final DocumentRepository documentRepository;
    private final UserService userService;
    private final EmployeeRepository employeeRepository;
    private final PermissionService permissionService;

    @PostMapping("/{documentId}/approve")
    public ResponseEntity<?> approveDocument(@PathVariable UUID documentId,
                                             Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = employeeRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Employee record not found"));

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Verify same organization
        if (!document.getEmployee().getOrganization().getId().equals(currentEmployee.getOrganization().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        // Check if already approved or rejected
        if ("APPROVED".equals(document.getApprovalStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Document is already approved"));
        }

        // Approve document
        document.setApprovalStatus("APPROVED");
        document.setApprovedBy(currentUser);
        document.setApprovedAt(LocalDateTime.now());
        document.setRejectionReason(null);
        documentRepository.save(document);

        return ResponseEntity.ok(Map.of(
                "message", "Document approved successfully",
                "documentId", documentId,
                "approvedBy", currentUser.getEmail(),
                "approvedAt", document.getApprovedAt()
        ));
    }

    @PostMapping("/{documentId}/reject")
    public ResponseEntity<?> rejectDocument(@PathVariable UUID documentId,
                                           @Valid @RequestBody DocumentRejectionRequest request,
                                           Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = employeeRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Employee record not found"));

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Verify same organization
        if (!document.getEmployee().getOrganization().getId().equals(currentEmployee.getOrganization().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        // Check if already approved
        if ("APPROVED".equals(document.getApprovalStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot reject an approved document"));
        }

        // Reject document
        document.setApprovalStatus("REJECTED");
        document.setApprovedBy(currentUser);
        document.setApprovedAt(LocalDateTime.now());
        document.setRejectionReason(request.getReason());
        documentRepository.save(document);

        return ResponseEntity.ok(Map.of(
                "message", "Document rejected",
                "documentId", documentId,
                "rejectedBy", currentUser.getEmail(),
                "rejectedAt", document.getApprovedAt(),
                "reason", request.getReason()
        ));
    }

    @Data
    public static class DocumentRejectionRequest {
        @NotBlank(message = "Rejection reason is required")
        private String reason;
    }
}
