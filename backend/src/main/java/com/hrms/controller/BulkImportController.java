package com.hrms.controller;

import com.hrms.dto.employee.BulkImportResponse;
import com.hrms.service.BulkEmployeeImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for Bulk Employee Import
 * Provides endpoints for CSV upload and template download
 */
@RestController
@RequestMapping("/api/organizations/{orgId}/employees")
public class BulkImportController {

    private static final Logger logger = LoggerFactory.getLogger(BulkImportController.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final BulkEmployeeImportService bulkImportService;

    public BulkImportController(BulkEmployeeImportService bulkImportService) {
        this.bulkImportService = bulkImportService;
    }

    /**
     * Import employees from CSV file
     *
     * @param orgId Organization ID
     * @param file CSV file containing employee data
     * @param skipDuplicates If true, skip duplicate entries instead of failing
     * @return Import results with success/failure details per row
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> importEmployees(
            @PathVariable UUID orgId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "skipDuplicates", defaultValue = "true") boolean skipDuplicates) {

        logger.info("Bulk import request received for organization {} - file: {}, size: {} bytes",
                orgId, file.getOriginalFilename(), file.getSize());

        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File size exceeds maximum limit of 10MB"));
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only CSV files are allowed"));
        }

        try {
            BulkImportResponse response = bulkImportService.importEmployeesFromCsv(file, orgId, skipDuplicates);

            if ("failed".equals(response.getStatus()) && response.getSuccessCount() == 0) {
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
            }

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid import request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            logger.error("Bulk import failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Import failed: " + e.getMessage()));
        }
    }

    /**
     * Download CSV template for bulk import
     */
    @GetMapping("/import/template")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<String> downloadTemplate(@PathVariable UUID orgId) {
        logger.info("Template download requested for organization {}", orgId);

        String template = bulkImportService.generateCsvTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "employee_import_template.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(template);
    }

    /**
     * Get import instructions
     */
    @GetMapping("/import/instructions")
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> getImportInstructions(@PathVariable UUID orgId) {
        return ResponseEntity.ok(Map.of(
                "maxFileSize", "10MB",
                "fileFormat", "CSV (comma-separated values)",
                "encoding", "UTF-8",
                "requiredFields", new String[]{"employee_code", "first_name", "last_name", "email"},
                "dateFormat", "yyyy-MM-dd",
                "employmentTypes", new String[]{"full_time", "part_time", "contract", "intern"},
                "employmentStatuses", new String[]{"active", "probation", "on_leave", "notice_period", "resigned", "terminated"},
                "workModes", new String[]{"on_site", "remote", "hybrid"},
                "payFrequencies", new String[]{"monthly", "bi_weekly", "weekly"},
                "notes", new String[]{
                    "Download the template first to see all available columns",
                    "Required fields must be filled for each row",
                    "Dates should be in yyyy-MM-dd format (e.g., 2024-01-15)",
                    "Department and Position codes must exist in the system",
                    "Manager (reports_to_code) must be an existing employee code",
                    "Duplicate employee codes or emails will be skipped (or fail based on settings)",
                    "User accounts will be created automatically with temporary passwords"
                }
        ));
    }

    /**
     * Validate CSV file without importing
     */
    @PostMapping(value = "/import/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> validateImportFile(
            @PathVariable UUID orgId,
            @RequestParam("file") MultipartFile file) {

        logger.info("Validation request received for organization {} - file: {}", orgId, file.getOriginalFilename());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("valid", false, "error", "File is empty"));
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("valid", false, "error", "Only CSV files are allowed"));
        }

        // For now, just check file structure
        // A full implementation would parse and validate without saving
        return ResponseEntity.ok(Map.of(
                "valid", true,
                "message", "File format is valid. Proceed with import to see detailed validation results."
        ));
    }
}
