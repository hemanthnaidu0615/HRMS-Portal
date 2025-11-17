package com.hrms.service;

import com.hrms.entity.AuditLog;
import com.hrms.entity.AuditLog.AuditStatus;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.repository.AuditLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for creating audit trail entries
 *
 * Logs all critical operations:
 * - Permission changes (grant/revoke)
 * - Role assignments
 * - User management (create/update/delete)
 * - Employee management
 * - Document operations
 */
@Service
public class AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditLogService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Log a successful action
     */
    @Transactional
    public void logSuccess(String actionType, String entityType, String entityId,
                          User performedBy, Organization organization) {
        logSuccess(actionType, entityType, entityId, performedBy, organization, null, null, null);
    }

    /**
     * Log a successful action with old/new values
     */
    @Transactional
    public void logSuccess(String actionType, String entityType, String entityId,
                          User performedBy, Organization organization,
                          String oldValue, String newValue) {
        logSuccess(actionType, entityType, entityId, performedBy, organization, oldValue, newValue, null);
    }

    /**
     * Log a successful action with full details
     */
    @Transactional
    public void logSuccess(String actionType, String entityType, String entityId,
                          User performedBy, Organization organization,
                          String oldValue, String newValue, Map<String, Object> metadata) {
        try {
            AuditLog log = new AuditLog(actionType, entityType, entityId, performedBy, organization);
            log.setStatus(AuditStatus.SUCCESS);
            log.setOldValue(oldValue);
            log.setNewValue(newValue);
            log.setIpAddress(getClientIpAddress());

            if (metadata != null && !metadata.isEmpty()) {
                log.setMetadata(objectMapper.writeValueAsString(metadata));
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            logger.error("Failed to create audit log for action: " + actionType, e);
            // Don't throw - audit failure shouldn't block business operations
        }
    }

    /**
     * Log a failed action
     */
    @Transactional
    public void logFailure(String actionType, String entityType, String entityId,
                          User performedBy, Organization organization, String errorMessage) {
        logFailure(actionType, entityType, entityId, performedBy, organization, errorMessage, null);
    }

    /**
     * Log a failed action with metadata
     */
    @Transactional
    public void logFailure(String actionType, String entityType, String entityId,
                          User performedBy, Organization organization,
                          String errorMessage, Map<String, Object> metadata) {
        try {
            AuditLog log = new AuditLog(actionType, entityType, entityId, performedBy, organization);
            log.setStatus(AuditStatus.FAILED);
            log.setErrorMessage(errorMessage);
            log.setIpAddress(getClientIpAddress());

            if (metadata != null && !metadata.isEmpty()) {
                log.setMetadata(objectMapper.writeValueAsString(metadata));
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            logger.error("Failed to create audit log for failed action: " + actionType, e);
        }
    }

    /**
     * Log permission grant
     */
    public void logPermissionGrant(User performedBy, Organization organization,
                                   String targetEmployeeId, String permissionGroupName) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("targetEmployeeId", targetEmployeeId);
        metadata.put("permissionGroup", permissionGroupName);

        logSuccess("PERMISSION_GRANT", "PermissionGroup", targetEmployeeId,
                  performedBy, organization, null, permissionGroupName, metadata);
    }

    /**
     * Log permission revoke
     */
    public void logPermissionRevoke(User performedBy, Organization organization,
                                    String targetEmployeeId, String permissionGroupName) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("targetEmployeeId", targetEmployeeId);
        metadata.put("permissionGroup", permissionGroupName);

        logSuccess("PERMISSION_REVOKE", "PermissionGroup", targetEmployeeId,
                  performedBy, organization, permissionGroupName, null, metadata);
    }

    /**
     * Log role assignment
     */
    public void logRoleAssignment(User performedBy, Organization organization,
                                 String targetUserId, String roleName) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("targetUserId", targetUserId);
        metadata.put("role", roleName);

        logSuccess("ROLE_ASSIGN", "Role", targetUserId,
                  performedBy, organization, null, roleName, metadata);
    }

    /**
     * Log role removal
     */
    public void logRoleRemoval(User performedBy, Organization organization,
                              String targetUserId, String roleName) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("targetUserId", targetUserId);
        metadata.put("role", roleName);

        logSuccess("ROLE_REMOVE", "Role", targetUserId,
                  performedBy, organization, roleName, null, metadata);
    }

    /**
     * Log user creation
     */
    public void logUserCreation(User performedBy, Organization organization, String newUserId, String email) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("email", email);

        logSuccess("USER_CREATE", "User", newUserId,
                  performedBy, organization, null, email, metadata);
    }

    /**
     * Log user update
     */
    public void logUserUpdate(User performedBy, Organization organization, String userId, String changes) {
        logSuccess("USER_UPDATE", "User", userId,
                  performedBy, organization, null, changes, null);
    }

    /**
     * Log user deletion
     */
    public void logUserDeletion(User performedBy, Organization organization, String userId, String email) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("email", email);

        logSuccess("USER_DELETE", "User", userId,
                  performedBy, organization, email, null, metadata);
    }

    /**
     * Log privilege escalation attempt
     */
    public void logPrivilegeEscalationAttempt(User performedBy, Organization organization,
                                             String targetUserId, String attemptedAction) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("targetUserId", targetUserId);
        metadata.put("attemptedAction", attemptedAction);
        metadata.put("severity", "HIGH");

        logFailure("PRIVILEGE_ESCALATION_ATTEMPT", "Security", targetUserId,
                  performedBy, organization, "User attempted unauthorized privilege escalation", metadata);

        logger.warn("SECURITY ALERT: User {} attempted privilege escalation on user {}: {}",
                   performedBy.getEmail(), targetUserId, attemptedAction);
    }

    /**
     * Get client IP address from request
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();

                // Check X-Forwarded-For header first (for proxies/load balancers)
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }

                // Fall back to remote address
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            logger.debug("Could not determine client IP address", e);
        }

        return null;
    }
}
