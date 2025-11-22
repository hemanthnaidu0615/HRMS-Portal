package com.hrms.controller.employee;

import com.hrms.dto.employee.request.IdentityDocumentRequest;
import com.hrms.dto.employee.response.IdentityDocumentResponse;
import com.hrms.entity.User;
import com.hrms.service.employee.EmployeeIdentityDocumentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Employee Identity Documents
 */
@RestController
@RequestMapping("/api/employees/{employeeId}/identity-documents")
public class EmployeeIdentityDocumentController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeIdentityDocumentController.class);

    private final EmployeeIdentityDocumentService documentService;

    public EmployeeIdentityDocumentController(EmployeeIdentityDocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Get all identity documents for an employee
     */
    @GetMapping
    public ResponseEntity<List<IdentityDocumentResponse>> getDocuments(
            @PathVariable UUID employeeId
    ) {
        List<IdentityDocumentResponse> documents = documentService.getDocumentsByEmployeeId(employeeId);
        return ResponseEntity.ok(documents);
    }

    /**
     * Get a specific identity document
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<IdentityDocumentResponse> getDocument(
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId
    ) {
        IdentityDocumentResponse document = documentService.getDocumentById(documentId);
        return ResponseEntity.ok(document);
    }

    /**
     * Add a new identity document
     */
    @PostMapping
    public ResponseEntity<IdentityDocumentResponse> addDocument(
            @PathVariable UUID employeeId,
            @Valid @RequestBody IdentityDocumentRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Adding identity document for employee: {}", employeeId);
        IdentityDocumentResponse document = documentService.addDocument(employeeId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(document);
    }

    /**
     * Update an identity document
     */
    @PutMapping("/{documentId}")
    public ResponseEntity<IdentityDocumentResponse> updateDocument(
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId,
            @Valid @RequestBody IdentityDocumentRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Updating identity document {} for employee: {}", documentId, employeeId);
        IdentityDocumentResponse document = documentService.updateDocument(documentId, request, currentUser);
        return ResponseEntity.ok(document);
    }

    /**
     * Delete an identity document
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Deleting identity document {} for employee: {}", documentId, employeeId);
        documentService.deleteDocument(documentId, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * Verify an identity document (Admin only)
     */
    @PostMapping("/{documentId}/verify")
    public ResponseEntity<IdentityDocumentResponse> verifyDocument(
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId,
            @RequestParam boolean approved,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Verifying identity document {} for employee: {} - approved: {}",
                documentId, employeeId, approved);
        IdentityDocumentResponse document = documentService.verifyDocument(documentId, approved, notes, currentUser);
        return ResponseEntity.ok(document);
    }

    /**
     * Get documents expiring within N days (Admin endpoint)
     */
    @GetMapping("/expiring")
    public ResponseEntity<List<IdentityDocumentResponse>> getExpiringDocuments(
            @RequestParam(defaultValue = "30") int days
    ) {
        List<IdentityDocumentResponse> documents = documentService.getExpiringDocuments(days);
        return ResponseEntity.ok(documents);
    }
}
