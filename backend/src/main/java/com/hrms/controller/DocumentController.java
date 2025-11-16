package com.hrms.controller;

import com.hrms.dto.DocumentResponse;
import com.hrms.dto.DocumentUploadResponse;
import com.hrms.entity.Document;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.DocumentService;
import com.hrms.service.EmployeeService;
import com.hrms.service.FileStorageService;
import com.hrms.service.PermissionService;
import com.hrms.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final FileStorageService fileStorageService;
    private final UserService userService;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final PermissionService permissionService;

    public DocumentController(DocumentService documentService,
                             FileStorageService fileStorageService,
                             UserService userService,
                             EmployeeRepository employeeRepository,
                             EmployeeService employeeService,
                             PermissionService permissionService) {
        this.documentService = documentService;
        this.fileStorageService = fileStorageService;
        this.userService = userService;
        this.employeeRepository = employeeRepository;
        this.employeeService = employeeService;
        this.permissionService = permissionService;
    }

    @PostMapping("/me/upload")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> uploadForSelf(@RequestParam("file") MultipartFile file, Authentication authentication) {
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

        DocumentResponse response = toDocumentResponse(document);
        return ResponseEntity.ok(new DocumentUploadResponse("Document uploaded successfully", response));
    }

    @PostMapping("/employee/{employeeId}/upload")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> uploadForEmployee(@PathVariable UUID employeeId,
                                              @RequestParam("file") MultipartFile file,
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

        DocumentResponse response = toDocumentResponse(document);
        return ResponseEntity.ok(new DocumentUploadResponse("Document uploaded successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ORGADMIN', 'SUPERADMIN')")
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
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
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
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> getOrganizationDocuments(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee currentEmployee = getOrCreateEmployee(user);

        if (user.getOrganization() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User has no organization"));
        }

        List<Document> documents;

        // Check if user has full org access or only team access
        boolean hasFullOrgAccess = permissionService.has(currentEmployee, "VIEW_ORG_DOCS");
        boolean hasTeamAccess = permissionService.has(currentEmployee, "VIEW_DEPT_DOCS");

        if (hasFullOrgAccess) {
            // Full org access (e.g., org admin)
            documents = documentService.getDocumentsForOrganization(currentEmployee.getOrganization());
        } else if (hasTeamAccess) {
            // Team/subtree access only
            List<Employee> teamMembers = employeeService.getReportingTree(currentEmployee.getId());
            teamMembers.add(currentEmployee); // Include self

            documents = teamMembers.stream()
                    .flatMap(emp -> documentService.getDocumentsForEmployee(emp).stream())
                    .collect(Collectors.toList());
        } else {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        List<DocumentResponse> responses = documents.stream()
                .map(this::toDocumentResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
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
