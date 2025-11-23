package com.hrms.dto.employee;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for bulk employee import operation.
 * Contains summary and detailed results of the import.
 */
public class BulkImportResponse {

    private UUID importId;
    private LocalDateTime importedAt;
    private String status; // completed, partial, failed

    // Summary
    private int totalRows;
    private int successCount;
    private int failedCount;
    private int skippedCount;

    // Details
    private List<ImportRowResult> results = new ArrayList<>();
    private List<String> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();

    // ==================== Constructors ====================

    public BulkImportResponse() {
        this.importId = UUID.randomUUID();
        this.importedAt = LocalDateTime.now();
    }

    public static BulkImportResponse success(int total, int success, List<ImportRowResult> results) {
        BulkImportResponse response = new BulkImportResponse();
        response.setTotalRows(total);
        response.setSuccessCount(success);
        response.setFailedCount(total - success);
        response.setResults(results);
        response.setStatus(success == total ? "completed" : (success > 0 ? "partial" : "failed"));
        return response;
    }

    public static BulkImportResponse failure(String error) {
        BulkImportResponse response = new BulkImportResponse();
        response.setStatus("failed");
        response.getErrors().add(error);
        return response;
    }

    // ==================== Row Result ====================

    public static class ImportRowResult {
        private int rowNumber;
        private String employeeCode;
        private String email;
        private String status; // success, failed, skipped
        private UUID employeeId; // if created
        private List<String> errors = new ArrayList<>();
        private List<String> warnings = new ArrayList<>();

        public ImportRowResult() {}

        public ImportRowResult(int rowNumber, String employeeCode, String email) {
            this.rowNumber = rowNumber;
            this.employeeCode = employeeCode;
            this.email = email;
        }

        public static ImportRowResult success(int row, String code, String email, UUID employeeId) {
            ImportRowResult result = new ImportRowResult(row, code, email);
            result.setStatus("success");
            result.setEmployeeId(employeeId);
            return result;
        }

        public static ImportRowResult failed(int row, String code, String email, List<String> errors) {
            ImportRowResult result = new ImportRowResult(row, code, email);
            result.setStatus("failed");
            result.setErrors(errors);
            return result;
        }

        public static ImportRowResult skipped(int row, String code, String email, String reason) {
            ImportRowResult result = new ImportRowResult(row, code, email);
            result.setStatus("skipped");
            result.getWarnings().add(reason);
            return result;
        }

        // Getters and Setters
        public int getRowNumber() { return rowNumber; }
        public void setRowNumber(int rowNumber) { this.rowNumber = rowNumber; }

        public String getEmployeeCode() { return employeeCode; }
        public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public UUID getEmployeeId() { return employeeId; }
        public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

        public List<String> getErrors() { return errors; }
        public void setErrors(List<String> errors) { this.errors = errors; }

        public List<String> getWarnings() { return warnings; }
        public void setWarnings(List<String> warnings) { this.warnings = warnings; }
    }

    // ==================== Getters and Setters ====================

    public UUID getImportId() { return importId; }
    public void setImportId(UUID importId) { this.importId = importId; }

    public LocalDateTime getImportedAt() { return importedAt; }
    public void setImportedAt(LocalDateTime importedAt) { this.importedAt = importedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }

    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }

    public int getFailedCount() { return failedCount; }
    public void setFailedCount(int failedCount) { this.failedCount = failedCount; }

    public int getSkippedCount() { return skippedCount; }
    public void setSkippedCount(int skippedCount) { this.skippedCount = skippedCount; }

    public List<ImportRowResult> getResults() { return results; }
    public void setResults(List<ImportRowResult> results) { this.results = results; }

    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }

    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }
}
