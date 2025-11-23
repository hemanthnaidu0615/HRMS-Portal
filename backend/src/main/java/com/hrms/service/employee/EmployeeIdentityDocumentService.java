package com.hrms.service.employee;

import com.hrms.dto.employee.request.IdentityDocumentRequest;
import com.hrms.dto.employee.response.IdentityDocumentResponse;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.entity.employee.EmployeeIdentityDocument;
import com.hrms.entity.employee.IdentityDocumentType;
import com.hrms.exception.BusinessException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.employee.EmployeeIdentityDocumentRepository;
import com.hrms.repository.employee.IdentityDocumentTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmployeeIdentityDocumentService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeIdentityDocumentService.class);

    private final EmployeeIdentityDocumentRepository documentRepository;
    private final IdentityDocumentTypeRepository documentTypeRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeIdentityDocumentService(
            EmployeeIdentityDocumentRepository documentRepository,
            IdentityDocumentTypeRepository documentTypeRepository,
            EmployeeRepository employeeRepository
    ) {
        this.documentRepository = documentRepository;
        this.documentTypeRepository = documentTypeRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Get available document types for a country
     */
    public List<IdentityDocumentType> getDocumentTypesForCountry(String countryCode) {
        return documentTypeRepository.findByCountryCodeOrUniversal(countryCode);
    }

    /**
     * Get required document types for onboarding
     */
    public List<IdentityDocumentType> getRequiredDocumentsForOnboarding(String countryCode) {
        return documentTypeRepository.findRequiredForOnboarding(countryCode);
    }

    /**
     * Get all active identity documents for an employee
     */
    public List<IdentityDocumentResponse> getDocumentsByEmployeeId(UUID employeeId) {
        return documentRepository.findByEmployeeIdAndIsActiveTrue(employeeId)
                .stream()
                .map(IdentityDocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific document by ID
     */
    public IdentityDocumentResponse getDocumentById(UUID documentId) {
        EmployeeIdentityDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> ResourceNotFoundException.identityDocument(documentId));
        return IdentityDocumentResponse.fromEntity(document);
    }

    /**
     * Add a new identity document
     */
    @Transactional
    public IdentityDocumentResponse addDocument(UUID employeeId, IdentityDocumentRequest request, User currentUser) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        // Get document type
        IdentityDocumentType documentType = documentTypeRepository.findByDocumentCodeAndIsActiveTrue(request.getDocumentCode())
                .orElseThrow(() -> ResourceNotFoundException.documentType(request.getDocumentCode()));

        // Check if document type already exists for employee
        documentRepository.findByEmployeeIdAndDocumentCode(employeeId, request.getDocumentCode())
                .ifPresent(existing -> {
                    throw BusinessException.documentTypeAlreadyExists(documentType.getDisplayName());
                });

        // Validate document number format if pattern is specified
        if (documentType.getValidationPattern() != null && request.getDocumentNumber() != null) {
            if (!request.getDocumentNumber().matches(documentType.getValidationPattern())) {
                throw BusinessException.invalidDocumentFormat(documentType.getDisplayName());
            }
        }

        EmployeeIdentityDocument document = EmployeeIdentityDocument.builder()
                .employee(employee)
                .organization(employee.getOrganization())
                .documentType(documentType)
                .documentNumber(request.getDocumentNumber())
                .issuingAuthority(request.getIssuingAuthority())
                .issuingCountry(request.getIssuingCountry())
                .issueDate(request.getIssueDate())
                .expiryDate(request.getExpiryDate())
                .verificationStatus(EmployeeIdentityDocument.VerificationStatus.PENDING)
                .createdBy(currentUser)
                .isActive(true)
                .build();

        EmployeeIdentityDocument saved = documentRepository.save(document);
        logger.info("Added identity document {} ({}) for employee {}",
                saved.getId(), documentType.getDocumentCode(), employeeId);

        return IdentityDocumentResponse.fromEntity(saved);
    }

    /**
     * Update an identity document
     */
    @Transactional
    public IdentityDocumentResponse updateDocument(UUID documentId, IdentityDocumentRequest request, User currentUser) {
        EmployeeIdentityDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> ResourceNotFoundException.identityDocument(documentId));

        // If updating document number, validate format
        if (request.getDocumentNumber() != null && document.getDocumentType().getValidationPattern() != null) {
            if (!request.getDocumentNumber().matches(document.getDocumentType().getValidationPattern())) {
                throw BusinessException.invalidDocumentFormat(document.getDocumentType().getDisplayName());
            }
            document.setDocumentNumber(request.getDocumentNumber());
            // Reset verification if document number changed
            document.setVerificationStatus(EmployeeIdentityDocument.VerificationStatus.PENDING);
            document.setVerifiedAt(null);
            document.setVerifiedBy(null);
        }

        if (request.getIssuingAuthority() != null) {
            document.setIssuingAuthority(request.getIssuingAuthority());
        }
        if (request.getIssuingCountry() != null) {
            document.setIssuingCountry(request.getIssuingCountry());
        }
        if (request.getIssueDate() != null) {
            document.setIssueDate(request.getIssueDate());
        }
        if (request.getExpiryDate() != null) {
            document.setExpiryDate(request.getExpiryDate());
        }

        document.setUpdatedBy(currentUser);
        EmployeeIdentityDocument saved = documentRepository.save(document);
        logger.info("Updated identity document {} for employee {}", documentId, document.getEmployee().getId());

        return IdentityDocumentResponse.fromEntity(saved);
    }

    /**
     * Verify an identity document
     */
    @Transactional
    public IdentityDocumentResponse verifyDocument(UUID documentId, boolean approved, String notes, User verifier) {
        EmployeeIdentityDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> ResourceNotFoundException.identityDocument(documentId));

        if (approved) {
            document.setVerificationStatus(EmployeeIdentityDocument.VerificationStatus.VERIFIED);
        } else {
            document.setVerificationStatus(EmployeeIdentityDocument.VerificationStatus.REJECTED);
        }

        document.setVerifiedAt(LocalDateTime.now());
        document.setVerifiedBy(verifier);
        document.setVerificationNotes(notes);
        document.setUpdatedBy(verifier);

        EmployeeIdentityDocument saved = documentRepository.save(document);
        logger.info("Document {} verification: {} by user {}",
                documentId, approved ? "APPROVED" : "REJECTED", verifier.getId());

        return IdentityDocumentResponse.fromEntity(saved);
    }

    /**
     * Soft delete an identity document
     */
    @Transactional
    public void deleteDocument(UUID documentId, User currentUser) {
        EmployeeIdentityDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> ResourceNotFoundException.identityDocument(documentId));

        document.setIsActive(false);
        document.setUpdatedBy(currentUser);
        documentRepository.save(document);

        logger.info("Deleted identity document {} for employee {}", documentId, document.getEmployee().getId());
    }

    /**
     * Get documents expiring within days
     */
    public List<IdentityDocumentResponse> getExpiringDocuments(int days) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days);
        return documentRepository.findDocumentsExpiringSoon(today, endDate)
                .stream()
                .map(IdentityDocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get documents pending verification for an organization
     */
    public List<IdentityDocumentResponse> getPendingVerification(UUID organizationId) {
        return documentRepository.findAllPendingVerificationByOrganization(organizationId)
                .stream()
                .map(IdentityDocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Check if employee has required identity documents
     */
    public boolean hasIdentityDocument(UUID employeeId) {
        return documentRepository.countVerifiedDocumentsByEmployeeId(employeeId) > 0;
    }
}
