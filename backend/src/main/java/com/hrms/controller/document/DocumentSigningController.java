package com.hrms.controller.document;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.model.document.EmployeeDocumentToSign;
import com.hrms.model.document.OnboardingDocumentChecklist;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.UserRepository;
import com.hrms.repository.document.EmployeeDocumentToSignRepository;
import com.hrms.security.JwtAuthenticationFilter;
import com.hrms.service.document.DocumentSigningService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API for Document Signing
 * Handles employee document signing, viewing, and onboarding checklist
 */
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DocumentSigningController {

    private final DocumentSigningService documentSigningService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeDocumentToSignRepository employeeDocumentRepository;

    /**
     * Get pending documents for the current user
     */
    @GetMapping("/pending")
    public ResponseEntity<List<EmployeeDocumentToSign>> getPendingDocuments(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        log.debug("GET /api/documents/pending - userId: {}", userId);

        Employee employee = employeeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Employee profile not found for user"));

        List<EmployeeDocumentToSign> documents = documentSigningService.getPendingDocumentsForEmployee(employee.getId());
        return ResponseEntity.ok(documents);
    }

    /**
     * Get all documents for the current user
     */
    @GetMapping("/my-documents")
    public ResponseEntity<List<EmployeeDocumentToSign>> getMyDocuments(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        log.debug("GET /api/documents/my-documents - userId: {}", userId);

        Employee employee = employeeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Employee profile not found for user"));

        List<EmployeeDocumentToSign> documents = documentSigningService.getDocumentsForEmployee(employee.getId());
        return ResponseEntity.ok(documents);
    }

    /**
     * Get a specific document by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDocumentToSign> getDocument(
            @PathVariable UUID id,
            HttpServletRequest request) {
        log.debug("GET /api/documents/{}", id);

        UUID userId = jwtAuthenticationFilter.getUserId(request);
        Employee employee = employeeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Employee profile not found for user"));

        EmployeeDocumentToSign document = documentSigningService.getDocumentsForEmployee(employee.getId())
                .stream()
                .filter(doc -> doc.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Document not found or access denied"));

        return ResponseEntity.ok(document);
    }

    /**
     * Mark document as viewed
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<EmployeeDocumentToSign> viewDocument(@PathVariable UUID id) {
        log.debug("POST /api/documents/{}/view", id);

        EmployeeDocumentToSign document = documentSigningService.markAsViewed(id);
        return ResponseEntity.ok(document);
    }

    /**
     * Sign a document
     */
    @PostMapping("/{id}/sign")
    public ResponseEntity<EmployeeDocumentToSign> signDocument(
            @PathVariable UUID id,
            @RequestBody SignDocumentRequest request,
            HttpServletRequest httpRequest) {

        log.debug("POST /api/documents/{}/sign", id);
        UUID userId = jwtAuthenticationFilter.getUserId(httpRequest);

        // Get IP address
        String ipAddress = httpRequest.getRemoteAddr();

        // Get actual user from database
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        EmployeeDocumentToSign document = documentSigningService.signDocument(
                id,
                request.getSignatureData(),
                ipAddress,
                user
        );

        return ResponseEntity.ok(document);
    }

    /**
     * Decline a document
     */
    @PostMapping("/{id}/decline")
    public ResponseEntity<EmployeeDocumentToSign> declineDocument(
            @PathVariable UUID id,
            @RequestBody DeclineDocumentRequest request) {

        log.debug("POST /api/documents/{}/decline", id);

        EmployeeDocumentToSign document = documentSigningService.declineDocument(id, request.getReason());
        return ResponseEntity.ok(document);
    }

    /**
     * Get onboarding checklist for the current user
     */
    @GetMapping("/onboarding/checklist")
    public ResponseEntity<List<OnboardingDocumentChecklist>> getOnboardingChecklist(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        log.debug("GET /api/documents/onboarding/checklist - userId: {}", userId);

        Employee employee = employeeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Employee profile not found for user"));

        List<OnboardingDocumentChecklist> checklist = documentSigningService.getOnboardingChecklist(employee.getId());
        return ResponseEntity.ok(checklist);
    }

    /**
     * Get onboarding completion status
     */
    @GetMapping("/onboarding/status")
    public ResponseEntity<DocumentSigningService.OnboardingCompletionStatus> getOnboardingStatus(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        log.debug("GET /api/documents/onboarding/status - userId: {}", userId);

        Employee employee = employeeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Employee profile not found for user"));

        DocumentSigningService.OnboardingCompletionStatus status =
                documentSigningService.getOnboardingCompletionStatus(employee.getId());

        return ResponseEntity.ok(status);
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Send a document to an employee for signing (Admin/Org Admin)
     */
    @PostMapping("/admin/send")
    public ResponseEntity<EmployeeDocumentToSign> sendDocument(
            @RequestBody SendDocumentRequest request,
            HttpServletRequest httpRequest) {

        UUID userId = jwtAuthenticationFilter.getUserId(httpRequest);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.debug("POST /api/documents/admin/send - Sending document to employee: {}", request.getEmployeeId());

        EmployeeDocumentToSign document = documentSigningService.sendDocumentForSigning(
                request.getEmployeeId(),
                request.getTemplateId(),
                user
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(document);
    }

    /**
     * Get all documents for the organization (Admin/Org Admin)
     */
    @GetMapping("/admin/organization")
    public ResponseEntity<List<EmployeeDocumentToSign>> getOrganizationDocuments(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.debug("GET /api/documents/admin/organization - orgId: {}", user.getOrganization().getId());

        List<EmployeeDocumentToSign> documents = employeeDocumentRepository
                .findByOrganizationId(user.getOrganization().getId());

        return ResponseEntity.ok(documents);
    }

    /**
     * Get documents by status for organization (Admin/Org Admin)
     */
    @GetMapping("/admin/organization/by-status")
    public ResponseEntity<List<EmployeeDocumentToSign>> getOrganizationDocumentsByStatus(
            @RequestParam List<String> statuses,
            HttpServletRequest request) {

        UUID userId = jwtAuthenticationFilter.getUserId(request);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.debug("GET /api/documents/admin/organization/by-status - statuses: {}", statuses);

        // Convert string statuses to enum
        List<EmployeeDocumentToSign.DocumentStatus> statusEnums = statuses.stream()
                .map(EmployeeDocumentToSign.DocumentStatus::valueOf)
                .toList();

        List<EmployeeDocumentToSign> documents = employeeDocumentRepository
                .findByOrganizationIdAndStatusIn(user.getOrganization().getId(), statusEnums);

        return ResponseEntity.ok(documents);
    }

    /**
     * Get pending documents count for organization (Admin/Org Admin)
     */
    @GetMapping("/admin/organization/pending-count")
    public ResponseEntity<PendingCountResponse> getOrganizationPendingCount(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long count = employeeDocumentRepository.countPendingByOrganizationId(user.getOrganization().getId());

        return ResponseEntity.ok(new PendingCountResponse(count));
    }

    /**
     * Upload and send a custom document (without template) to employee (Admin/Org Admin)
     */
    @PostMapping("/admin/upload-and-send")
    public ResponseEntity<EmployeeDocumentToSign> uploadAndSendDocument(
            @RequestBody UploadDocumentRequest request,
            HttpServletRequest httpRequest) {

        UUID userId = jwtAuthenticationFilter.getUserId(httpRequest);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        log.debug("POST /api/documents/admin/upload-and-send - Custom document for employee: {}",
                request.getEmployeeId());

        // Create document without template
        EmployeeDocumentToSign document = EmployeeDocumentToSign.builder()
                .organization(user.getOrganization())
                .employee(employee)
                .template(null) // No template for custom documents
                .documentName(request.getDocumentName())
                .documentType(request.getDocumentType())
                .description(request.getDescription())
                .fileStoragePath(request.getFileStoragePath())
                .fileType(request.getFileType())
                .fileSizeKb(request.getFileSizeKb())
                .status(EmployeeDocumentToSign.DocumentStatus.SENT)
                .sentAt(java.time.LocalDateTime.now())
                .expiryDate(request.getExpiryDate() != null ?
                        request.getExpiryDate() : java.time.LocalDateTime.now().plusDays(30))
                .employerSignatureRequired(request.getEmployerSignatureRequired() != null ?
                        request.getEmployerSignatureRequired() : false)
                .createdBy(user)
                .build();

        EmployeeDocumentToSign savedDocument = employeeDocumentRepository.save(document);
        log.info("Uploaded and sent custom document to employee: {}", employee.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedDocument);
    }

    // DTOs
    @Data
    public static class SignDocumentRequest {
        private String signatureData; // Base64 encoded signature image
    }

    @Data
    public static class DeclineDocumentRequest {
        private String reason;
    }

    @Data
    public static class SendDocumentRequest {
        private UUID employeeId;
        private UUID templateId;
    }

    @Data
    public static class UploadDocumentRequest {
        private UUID employeeId;
        private String documentName;
        private String documentType;
        private String description;
        private String fileStoragePath;
        private String fileType;
        private Integer fileSizeKb;
        private java.time.LocalDateTime expiryDate;
        private Boolean employerSignatureRequired;
    }

    @Data
    @lombok.AllArgsConstructor
    public static class PendingCountResponse {
        private long count;
    }
}
