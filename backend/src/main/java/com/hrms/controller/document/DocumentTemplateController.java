package com.hrms.controller.document;

import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.model.document.DocumentTemplate;
import com.hrms.repository.OrganizationRepository;
import com.hrms.repository.UserRepository;
import com.hrms.repository.document.DocumentTemplateRepository;
import com.hrms.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * REST API for Document Template Management (Admin/Org Admin)
 * Handles CRUD operations for document templates
 */
@RestController
@RequestMapping("/api/admin/document-templates")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DocumentTemplateController {

    private final DocumentTemplateRepository templateRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Get all templates for organization
     */
    @GetMapping
    public ResponseEntity<List<DocumentTemplate>> getAllTemplates(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<DocumentTemplate> templates = templateRepository.findByOrganizationId(user.getOrganization().getId());
        log.debug("GET /api/admin/document-templates - Found {} templates for org {}",
                templates.size(), user.getOrganization().getId());

        return ResponseEntity.ok(templates);
    }

    /**
     * Get active templates only
     */
    @GetMapping("/active")
    public ResponseEntity<List<DocumentTemplate>> getActiveTemplates(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<DocumentTemplate> templates = templateRepository.findActiveByOrganizationId(user.getOrganization().getId());
        return ResponseEntity.ok(templates);
    }

    /**
     * Get a specific template by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<DocumentTemplate> getTemplate(
            @PathVariable UUID id,
            HttpServletRequest request) {

        UUID userId = jwtAuthenticationFilter.getUserId(request);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DocumentTemplate template = templateRepository.findByIdNotDeleted(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        // Verify template belongs to user's organization
        if (!template.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        return ResponseEntity.ok(template);
    }

    /**
     * Create a new document template
     */
    @PostMapping
    public ResponseEntity<DocumentTemplate> createTemplate(
            @RequestBody CreateTemplateRequest request,
            HttpServletRequest httpRequest) {

        UUID userId = jwtAuthenticationFilter.getUserId(httpRequest);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.debug("POST /api/admin/document-templates - Creating template: {}", request.getName());

        DocumentTemplate template = DocumentTemplate.builder()
                .organization(user.getOrganization())
                .name(request.getName())
                .description(request.getDescription())
                .documentType(request.getDocumentType())
                .templateContent(request.getTemplateContent())
                .fileStoragePath(request.getFileStoragePath())
                .fileType(request.getFileType())
                .requiresSignature(request.getRequiresSignature() != null ? request.getRequiresSignature() : true)
                .signatureRequiredFrom(request.getSignatureRequiredFrom() != null ?
                        request.getSignatureRequiredFrom() : DocumentTemplate.SignatureRequiredFrom.EMPLOYEE)
                .autoSendOnHire(request.getAutoSendOnHire() != null ? request.getAutoSendOnHire() : false)
                .sendOrder(request.getSendOrder() != null ? request.getSendOrder() : 1)
                .isActive(true)
                .createdBy(user)
                .build();

        DocumentTemplate savedTemplate = templateRepository.save(template);
        log.info("Created document template: {} for org: {}", savedTemplate.getName(), user.getOrganization().getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedTemplate);
    }

    /**
     * Update an existing document template
     */
    @PutMapping("/{id}")
    public ResponseEntity<DocumentTemplate> updateTemplate(
            @PathVariable UUID id,
            @RequestBody UpdateTemplateRequest request,
            HttpServletRequest httpRequest) {

        UUID userId = jwtAuthenticationFilter.getUserId(httpRequest);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DocumentTemplate template = templateRepository.findByIdNotDeleted(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        // Verify template belongs to user's organization
        if (!template.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Update fields
        if (request.getName() != null) {
            template.setName(request.getName());
        }
        if (request.getDescription() != null) {
            template.setDescription(request.getDescription());
        }
        if (request.getDocumentType() != null) {
            template.setDocumentType(request.getDocumentType());
        }
        if (request.getTemplateContent() != null) {
            template.setTemplateContent(request.getTemplateContent());
        }
        if (request.getFileStoragePath() != null) {
            template.setFileStoragePath(request.getFileStoragePath());
        }
        if (request.getFileType() != null) {
            template.setFileType(request.getFileType());
        }
        if (request.getRequiresSignature() != null) {
            template.setRequiresSignature(request.getRequiresSignature());
        }
        if (request.getSignatureRequiredFrom() != null) {
            template.setSignatureRequiredFrom(request.getSignatureRequiredFrom());
        }
        if (request.getAutoSendOnHire() != null) {
            template.setAutoSendOnHire(request.getAutoSendOnHire());
        }
        if (request.getSendOrder() != null) {
            template.setSendOrder(request.getSendOrder());
        }
        if (request.getIsActive() != null) {
            template.setIsActive(request.getIsActive());
        }

        template.setUpdatedBy(user);
        template.setUpdatedAt(LocalDateTime.now());

        DocumentTemplate updatedTemplate = templateRepository.save(template);
        log.info("Updated document template: {}", updatedTemplate.getId());

        return ResponseEntity.ok(updatedTemplate);
    }

    /**
     * Delete a document template (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID userId = jwtAuthenticationFilter.getUserId(httpRequest);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DocumentTemplate template = templateRepository.findByIdNotDeleted(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        // Verify template belongs to user's organization
        if (!template.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        template.setDeletedAt(LocalDateTime.now());
        templateRepository.save(template);

        log.info("Soft deleted document template: {}", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Toggle template active status
     */
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<DocumentTemplate> toggleActive(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID userId = jwtAuthenticationFilter.getUserId(httpRequest);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DocumentTemplate template = templateRepository.findByIdNotDeleted(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        // Verify template belongs to user's organization
        if (!template.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        template.setIsActive(!template.getIsActive());
        template.setUpdatedBy(user);
        template.setUpdatedAt(LocalDateTime.now());

        DocumentTemplate updatedTemplate = templateRepository.save(template);
        log.info("Toggled active status for template: {} to {}", id, updatedTemplate.getIsActive());

        return ResponseEntity.ok(updatedTemplate);
    }

    // DTOs
    @Data
    public static class CreateTemplateRequest {
        private String name;
        private String description;
        private DocumentTemplate.DocumentType documentType;
        private String templateContent;
        private String fileStoragePath;
        private String fileType;
        private Boolean requiresSignature;
        private DocumentTemplate.SignatureRequiredFrom signatureRequiredFrom;
        private Boolean autoSendOnHire;
        private Integer sendOrder;
    }

    @Data
    public static class UpdateTemplateRequest {
        private String name;
        private String description;
        private DocumentTemplate.DocumentType documentType;
        private String templateContent;
        private String fileStoragePath;
        private String fileType;
        private Boolean requiresSignature;
        private DocumentTemplate.SignatureRequiredFrom signatureRequiredFrom;
        private Boolean autoSendOnHire;
        private Integer sendOrder;
        private Boolean isActive;
    }
}
