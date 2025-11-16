package com.hrms.controller;

import com.hrms.dto.DocumentResponse;
import com.hrms.dto.DocumentUploadResponse;
import com.hrms.entity.Document;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.DocumentService;
import com.hrms.service.EmailService;
import com.hrms.service.EmployeeService;
import com.hrms.service.FileStorageService;
import com.hrms.service.PermissionService;
import com.hrms.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);

    private final DocumentService documentService;
    private final FileStorageService fileStorageService;
    private final UserService userService;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final PermissionService permissionService;
    private final EmailService emailService;
    private final com.hrms.repository.DocumentRepository documentRepository;
    private final com.hrms.repository.DocumentRequestRepository documentRequestRepository;

    public DocumentController(DocumentService documentService,
                             FileStorageService fileStorageService,
                             UserService userService,
                             EmployeeRepository employeeRepository,
                             EmployeeService employeeService,
                             PermissionService permissionService,
                             EmailService emailService,
                             com.hrms.repository.DocumentRepository documentRepository,
                             com.hrms.repository.DocumentRequestRepository documentRequestRepository) {
        this.documentService = documentService;
        this.fileStorageService = fileStorageService;
        this.userService = userService;
        this.employeeRepository = employeeRepository;
        this.employeeService = employeeService;
        this.permissionService = permissionService;
        this.emailService = emailService;
        this.documentRepository = documentRepository;
        this.documentRequestRepository = documentRequestRepository;
    }

    @PostMapping("/me/upload")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN')")
    public ResponseEntity<?> uploadForSelf(@RequestParam("file") MultipartFile file,
                                           @RequestParam(value = "requestId", required = false) UUID requestId,
                                           Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee employee = getOrCreateEmployee(user);

        if (!permissionService.has(employee, "UPLOAD_OWN_DOCS")) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        String filePath = fileStorageService.store(file, employee.getId(), employee.getOrganization().getId());
        Document document = documentService.uploadForEmployee(
                employee,
                user,
                file.getOriginalFilename(),
                filePath,
                file.getContentType()
        );

        if (requestId != null) {
            documentRequestRepository.findById(requestId).ifPresent(req -> {
                if (req.getTargetEmployee().getId().equals(employee.getId())) {
                    req.setFulfilledDocument(document);
                    req.setStatus("COMPLETED");
                    req.setCompletedAt(LocalDateTime.now());
                    documentRequestRepository.save(req);

                    // Send email notification to requester
                    try {
                        String uploaderName = user.getEmail().split("@")[0];
                        String requesterEmail = req.getRequester().getEmail();
                        emailService.sendDocumentUploadedEmail(
                            requesterEmail,
                            uploaderName,
                            user.getEmail(),
                            document.getFileType() != null ? document.getFileType() : "Document",
                            document.getId().toString()
                        );
                    } catch (Exception e) {
                        logger.error("Failed to send document uploaded email to {}: {}", req.getRequester().getEmail(), e.getMessage(), e);
                    }
                }
            });
        }

        DocumentResponse response = toDocumentResponse(document);
        return ResponseEntity.ok(new DocumentUploadResponse("Document uploaded successfully", response));
    }

    @PostMapping("/employee/{employeeId}/upload")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<?> uploadForEmployee(@PathVariable UUID employeeId,
                                              @RequestParam("file") MultipartFile file,
                                              @RequestParam(value = "requestId", required = false) UUID requestId,
                                              Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = getOrCreateEmployee(user);

        if (!permissionService.has(currentEmployee, "UPLOAD_FOR_OTHERS")) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (user.getOrganization() == null || !user.getOrganization().getId().equals(employee.getOrganization().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        String filePath = fileStorageService.store(file, employee.getId(), employee.getOrganization().getId());
        Document document = documentService.uploadForEmployee(
                employee,
                user,
                file.getOriginalFilename(),
                filePath,
                file.getContentType()
        );

        if (requestId != null) {
            documentRequestRepository.findById(requestId).ifPresent(req -> {
                if (req.getTargetEmployee().getId().equals(employeeId)) {
                    req.setFulfilledDocument(document);
                    req.setStatus("COMPLETED");
                    req.setCompletedAt(LocalDateTime.now());
                    documentRequestRepository.save(req);

                    // Send email notification to requester
                    try {
                        String uploaderName = employee.getUser().getEmail().split("@")[0];
                        String requesterEmail = req.getRequester().getEmail();
                        emailService.sendDocumentUploadedEmail(
                            requesterEmail,
                            uploaderName,
                            employee.getUser().getEmail(),
                            document.getFileType() != null ? document.getFileType() : "Document",
                            document.getId().toString()
                        );
                    } catch (Exception e) {
                        logger.error("Failed to send document uploaded email to {}: {}", req.getRequester().getEmail(), e.getMessage(), e);
                    }
                }
            });
        }

        DocumentResponse response = toDocumentResponse(document);
        return ResponseEntity.ok(new DocumentUploadResponse("Document uploaded successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN')")
    public ResponseEntity<?> getMyDocuments(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee employee = getOrCreateEmployee(user);

        if (!permissionService.has(employee, "VIEW_OWN_DOCS")) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        List<Document> documents = documentService.getDocumentsForEmployee(employee);
        List<DocumentResponse> responses = documents.stream()
                .map(this::toDocumentResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<?> getEmployeeDocuments(@PathVariable UUID employeeId, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = getOrCreateEmployee(user);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (user.getOrganization() == null || !user.getOrganization().getId().equals(employee.getOrganization().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        if (employeeId.equals(currentEmployee.getId())) {
            if (!permissionService.has(currentEmployee, "VIEW_OWN_DOCS")) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
        } else {
            if (!permissionService.has(currentEmployee, "VIEW_ORG_DOCS") && !permissionService.has(currentEmployee, "VIEW_DEPT_DOCS")) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
        }

        List<Document> documents = documentService.getDocumentsForEmployee(employee);
        List<DocumentResponse> responses = documents.stream()
                .map(this::toDocumentResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/org")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getOrganizationDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = getOrCreateEmployee(user);

        if (user.getOrganization() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User has no organization"));
        }

        // Limit max page size to 100 to prevent performance issues
        int effectiveSize = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, effectiveSize);

        // Check if user has full org access or only team access
        boolean hasFullOrgAccess = permissionService.has(currentEmployee, "VIEW_ORG_DOCS");
        boolean hasTeamAccess = permissionService.has(currentEmployee, "VIEW_DEPT_DOCS");

        if (hasFullOrgAccess) {
            // Full org access (e.g., org admin) - use database pagination
            Page<Document> documents = documentService.getDocumentsForOrganization(currentEmployee.getOrganization(), pageable);
            Page<DocumentResponse> responses = documents.map(this::toDocumentResponse);
            return ResponseEntity.ok(responses);
        } else if (hasTeamAccess) {
            // Team/subtree access only - in-memory pagination (acceptable for team size)
            List<Employee> teamMembers = employeeService.getReportingTree(currentEmployee.getId());
            teamMembers.add(currentEmployee); // Include self

            List<Document> documents = teamMembers.stream()
                    .flatMap(emp -> documentService.getDocumentsForEmployee(emp).stream())
                    .collect(Collectors.toList());

            List<DocumentResponse> responses = documents.stream()
                    .map(this::toDocumentResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } else {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
    }

    @GetMapping("/{documentId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> downloadDocument(@PathVariable UUID documentId, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        Employee currentEmployee = getOrCreateEmployee(user);

        // Organization boundary check: Prevent cross-organization document access
        if (user.getOrganization() != null &&
                !document.getEmployee().getOrganization().getId().equals(currentEmployee.getOrganization().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        boolean allowed = false;

        // Owner with own-docs permission
        if (document.getEmployee().getId().equals(currentEmployee.getId()) &&
                permissionService.has(currentEmployee, "VIEW_OWN_DOCS")) {
            allowed = true;
        }

        // Org-wide access
        if (!allowed && permissionService.has(currentEmployee, "VIEW_ORG_DOCS")) {
            allowed = true;
        }

        // Team access (department/subtree)
        if (!allowed && permissionService.has(currentEmployee, "VIEW_DEPT_DOCS")) {
            List<Employee> team = employeeService.getReportingTree(currentEmployee.getId());
            allowed = team.stream().anyMatch(e -> e.getId().equals(document.getEmployee().getId()));
        }

        // Users with org upload permission typically need to review documents
        if (!allowed && permissionService.has(currentEmployee, "UPLOAD_FOR_OTHERS")) {
            allowed = true;
        }

        // Requester of fulfilled document request
        if (!allowed) {
            List<com.hrms.entity.DocumentRequest> reqs =
                    documentRequestRepository.findByFulfilledDocument_IdAndRequester_Id(documentId, user.getId());
            allowed = !reqs.isEmpty();
        }

        if (!allowed) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        InputStreamResource resource = new InputStreamResource(fileStorageService.load(document.getFilePath()));

        String filename = document.getFileName();
        String contentType = document.getFileType() != null ? document.getFileType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
        headers.setContentType(MediaType.parseMediaType(contentType));

        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
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

    private DocumentResponse toDocumentResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getEmployee().getId(),
                document.getUploadedBy().getId(),
                document.getFileName(),
                document.getFilePath(),
                document.getFileType(),
                document.getCreatedAt()
        );
    }
}
