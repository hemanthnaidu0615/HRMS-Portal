package com.hrms.service.document;

import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.model.document.DocumentTemplate;
import com.hrms.model.document.EmployeeDocumentToSign;
import com.hrms.model.document.OnboardingDocumentChecklist;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.document.DocumentTemplateRepository;
import com.hrms.repository.document.EmployeeDocumentToSignRepository;
import com.hrms.repository.document.OnboardingDocumentChecklistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentSigningService {

    private final DocumentTemplateRepository documentTemplateRepository;
    private final EmployeeDocumentToSignRepository employeeDocumentRepository;
    private final OnboardingDocumentChecklistRepository checklistRepository;
    private final EmployeeRepository employeeRepository;

    /**
     * Send a document to an employee for signing
     */
    @Transactional
    public EmployeeDocumentToSign sendDocumentForSigning(UUID employeeId, UUID templateId, User sentBy) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        DocumentTemplate template = documentTemplateRepository.findByIdNotDeleted(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        EmployeeDocumentToSign document = EmployeeDocumentToSign.builder()
                .organization(employee.getOrganization())
                .employee(employee)
                .template(template)
                .documentName(template.getName())
                .documentType(template.getDocumentType().name())
                .description(template.getDescription())
                .fileStoragePath(template.getFileStoragePath())
                .fileType(template.getFileType())
                .status(EmployeeDocumentToSign.DocumentStatus.SENT)
                .sentAt(LocalDateTime.now())
                .expiryDate(LocalDateTime.now().plusDays(30)) // Default 30 days
                .employerSignatureRequired(template.getSignatureRequiredFrom() == DocumentTemplate.SignatureRequiredFrom.BOTH ||
                        template.getSignatureRequiredFrom() == DocumentTemplate.SignatureRequiredFrom.EMPLOYER)
                .createdBy(sentBy)
                .build();

        return employeeDocumentRepository.save(document);
    }

    /**
     * Sign a document (employee signature)
     */
    @Transactional
    public EmployeeDocumentToSign signDocument(UUID documentId, String signatureData, String ipAddress, User signedBy) {
        EmployeeDocumentToSign document = employeeDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getStatus() != EmployeeDocumentToSign.DocumentStatus.SENT &&
            document.getStatus() != EmployeeDocumentToSign.DocumentStatus.VIEWED) {
            throw new RuntimeException("Document cannot be signed in its current state");
        }

        document.setEmployeeSignatureData(signatureData);
        document.setEmployeeSignatureIp(ipAddress);
        document.setEmployeeSignedBy(signedBy);
        document.setSignedAt(LocalDateTime.now());
        document.setStatus(EmployeeDocumentToSign.DocumentStatus.SIGNED);

        // If employer signature also required, keep in SIGNED status
        // Otherwise, mark as COMPLETED
        if (!document.getEmployerSignatureRequired()) {
            document.setStatus(EmployeeDocumentToSign.DocumentStatus.COMPLETED);
        }

        return employeeDocumentRepository.save(document);
    }

    /**
     * Mark document as viewed
     */
    @Transactional
    public EmployeeDocumentToSign markAsViewed(UUID documentId) {
        EmployeeDocumentToSign document = employeeDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getViewedAt() == null) {
            document.setViewedAt(LocalDateTime.now());
            if (document.getStatus() == EmployeeDocumentToSign.DocumentStatus.SENT) {
                document.setStatus(EmployeeDocumentToSign.DocumentStatus.VIEWED);
            }
        }

        return employeeDocumentRepository.save(document);
    }

    /**
     * Decline a document
     */
    @Transactional
    public EmployeeDocumentToSign declineDocument(UUID documentId, String reason) {
        EmployeeDocumentToSign document = employeeDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        document.setStatus(EmployeeDocumentToSign.DocumentStatus.DECLINED);
        document.setDeclinedAt(LocalDateTime.now());
        document.setDeclineReason(reason);

        return employeeDocumentRepository.save(document);
    }

    /**
     * Get pending documents for an employee
     */
    public List<EmployeeDocumentToSign> getPendingDocumentsForEmployee(UUID employeeId) {
        return employeeDocumentRepository.findByEmployeeIdAndStatus(employeeId, EmployeeDocumentToSign.DocumentStatus.SENT);
    }

    /**
     * Get all documents for an employee
     */
    public List<EmployeeDocumentToSign> getDocumentsForEmployee(UUID employeeId) {
        return employeeDocumentRepository.findByEmployeeId(employeeId);
    }

    /**
     * Get onboarding checklist for an employee
     */
    public List<OnboardingDocumentChecklist> getOnboardingChecklist(UUID employeeId) {
        return checklistRepository.findByEmployeeId(employeeId);
    }

    /**
     * Get onboarding completion status
     */
    public OnboardingCompletionStatus getOnboardingCompletionStatus(UUID employeeId) {
        long totalItems = checklistRepository.countByEmployeeId(employeeId);
        long completedItems = checklistRepository.countCompletedByEmployeeId(employeeId);
        long mandatoryItems = checklistRepository.countMandatoryByEmployeeId(employeeId);
        long mandatoryCompleted = checklistRepository.countMandatoryCompletedByEmployeeId(employeeId);

        return OnboardingCompletionStatus.builder()
                .totalItems(totalItems)
                .completedItems(completedItems)
                .mandatoryItems(mandatoryItems)
                .mandatoryCompleted(mandatoryCompleted)
                .completionPercentage(totalItems > 0 ? (int) ((completedItems * 100) / totalItems) : 0)
                .allMandatoryComplete(mandatoryItems == mandatoryCompleted)
                .build();
    }

    /**
     * Auto-send onboarding documents to a new employee
     */
    @Transactional
    public void autoSendOnboardingDocuments(UUID employeeId, User sentBy) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<DocumentTemplate> autoSendTemplates = documentTemplateRepository
                .findAutoSendTemplates(employee.getOrganization().getId());

        for (DocumentTemplate template : autoSendTemplates) {
            sendDocumentForSigning(employeeId, template.getId(), sentBy);
            log.info("Auto-sent document {} to employee {}", template.getName(), employeeId);
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class OnboardingCompletionStatus {
        private long totalItems;
        private long completedItems;
        private long mandatoryItems;
        private long mandatoryCompleted;
        private int completionPercentage;
        private boolean allMandatoryComplete;
    }
}
