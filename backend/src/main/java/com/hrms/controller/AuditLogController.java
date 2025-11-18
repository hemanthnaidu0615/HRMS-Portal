package com.hrms.controller;

import com.hrms.entity.AuditLog;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.repository.AuditLogRepository;
import com.hrms.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasAnyRole('ORGADMIN', 'SUPERADMIN')")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;
    private final UserService userService;

    public AuditLogController(AuditLogRepository auditLogRepository, UserService userService) {
        this.auditLogRepository = auditLogRepository;
        this.userService = userService;
    }

    /**
     * Get audit logs for the organization with filtering and pagination
     */
    @GetMapping
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {

        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            return ResponseEntity.status(403).body(Map.of("error", "User has no organization"));
        }

        // Create pageable with sort by performedAt descending
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "performedAt"));

        Page<AuditLog> auditLogsPage;

        // Apply filters
        if (actionType != null && !actionType.isEmpty() && entityType != null && !entityType.isEmpty()) {
            // Both filters
            auditLogsPage = auditLogRepository.findByOrganizationAndActionTypeOrderByPerformedAtDesc(
                    organization, actionType, pageable);
            // Further filter by entity type in memory (or create a more specific query method)
            List<AuditLog> filtered = auditLogsPage.getContent().stream()
                    .filter(log -> log.getEntityType() != null && log.getEntityType().equals(entityType))
                    .collect(Collectors.toList());
            auditLogsPage = new org.springframework.data.domain.PageImpl<>(
                    filtered, pageable, filtered.size());
        } else if (actionType != null && !actionType.isEmpty()) {
            auditLogsPage = auditLogRepository.findByOrganizationAndActionTypeOrderByPerformedAtDesc(
                    organization, actionType, pageable);
        } else if (entityType != null && !entityType.isEmpty()) {
            auditLogsPage = auditLogRepository.findByOrganizationAndEntityTypeOrderByPerformedAtDesc(
                    organization, entityType, pageable);
        } else {
            auditLogsPage = auditLogRepository.findByOrganizationOrderByPerformedAtDesc(
                    organization, pageable);
        }

        // Map to DTO
        List<Map<String, Object>> auditLogsData = auditLogsPage.getContent().stream()
                .map(this::mapAuditLogToDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", auditLogsData);
        response.put("totalElements", auditLogsPage.getTotalElements());
        response.put("totalPages", auditLogsPage.getTotalPages());
        response.put("currentPage", auditLogsPage.getNumber());
        response.put("pageSize", auditLogsPage.getSize());

        return ResponseEntity.ok(response);
    }

    /**
     * Get audit logs for a specific entity
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<?> getAuditLogsForEntity(
            @PathVariable String entityType,
            @PathVariable String entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            return ResponseEntity.status(403).body(Map.of("error", "User has no organization"));
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "performedAt"));
        Page<AuditLog> auditLogsPage = auditLogRepository.findByEntityTypeAndEntityIdOrderByPerformedAtDesc(
                entityType, entityId, pageable);

        // Filter by organization (security check)
        List<AuditLog> filtered = auditLogsPage.getContent().stream()
                .filter(log -> log.getOrganization() != null &&
                              log.getOrganization().getId().equals(organization.getId()))
                .collect(Collectors.toList());

        List<Map<String, Object>> auditLogsData = filtered.stream()
                .map(this::mapAuditLogToDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", auditLogsData);
        response.put("totalElements", filtered.size());
        response.put("entityType", entityType);
        response.put("entityId", entityId);

        return ResponseEntity.ok(response);
    }

    /**
     * Get available action types for filtering
     */
    @GetMapping("/action-types")
    public ResponseEntity<?> getActionTypes() {
        List<String> actionTypes = List.of(
                "CREATE", "UPDATE", "DELETE", "VIEW", "DOWNLOAD",
                "LOGIN", "LOGOUT", "PASSWORD_CHANGE",
                "PERMISSION_GRANT", "PERMISSION_REVOKE",
                "ROLE_ASSIGN", "ROLE_REMOVE",
                "USER_CREATE", "USER_UPDATE", "USER_DELETE",
                "DOCUMENT_UPLOAD", "DOCUMENT_APPROVE", "DOCUMENT_REJECT",
                "EMPLOYEE_CREATE", "EMPLOYEE_UPDATE", "EMPLOYEE_DELETE",
                "PRIVILEGE_ESCALATION_ATTEMPT"
        );
        return ResponseEntity.ok(actionTypes);
    }

    /**
     * Get available entity types for filtering
     */
    @GetMapping("/entity-types")
    public ResponseEntity<?> getEntityTypes() {
        List<String> entityTypes = List.of(
                "Employee", "User", "Document", "DocumentRequest",
                "Department", "Position", "Organization",
                "Role", "PermissionGroup", "Permission",
                "Vendor", "Client", "Project",
                "Security"
        );
        return ResponseEntity.ok(entityTypes);
    }

    /**
     * Map AuditLog entity to DTO
     */
    private Map<String, Object> mapAuditLogToDto(AuditLog log) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", log.getId().toString());
        dto.put("actionType", log.getActionType());
        dto.put("entityType", log.getEntityType());
        dto.put("entityId", log.getEntityId());
        dto.put("status", log.getStatus().toString());
        dto.put("performedAt", log.getPerformedAt());
        dto.put("ipAddress", log.getIpAddress());
        dto.put("metadata", log.getMetadata());
        dto.put("oldValue", log.getOldValue());
        dto.put("newValue", log.getNewValue());
        dto.put("errorMessage", log.getErrorMessage());

        if (log.getPerformedBy() != null) {
            Map<String, Object> performedByDto = new HashMap<>();
            performedByDto.put("id", log.getPerformedBy().getId().toString());
            performedByDto.put("email", log.getPerformedBy().getEmail());
            dto.put("performedBy", performedByDto);
        }

        return dto;
    }
}
