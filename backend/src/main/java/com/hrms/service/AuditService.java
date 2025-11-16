package com.hrms.service;

import com.hrms.entity.AuditLog;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async("emailTaskExecutor") // Reuse existing async executor
    public void logAction(String actionType, String entityType, String entityId, User performedBy, Organization organization) {
        try {
            AuditLog auditLog = new AuditLog(actionType, entityType, entityId, performedBy, organization);
            auditLogRepository.save(auditLog);
            log.debug("Audit log created: {} {} by {}", actionType, entityType, performedBy.getEmail());
        } catch (Exception e) {
            log.error("Failed to create audit log: {} {} by {}", actionType, entityType, performedBy != null ? performedBy.getEmail() : "unknown", e);
        }
    }

    @Async("emailTaskExecutor")
    public void logActionWithValues(String actionType, String entityType, String entityId, User performedBy, Organization organization, String oldValue, String newValue) {
        try {
            AuditLog auditLog = new AuditLog(actionType, entityType, entityId, performedBy, organization);
            auditLog.setOldValue(oldValue);
            auditLog.setNewValue(newValue);
            auditLogRepository.save(auditLog);
            log.debug("Audit log created: {} {} by {}", actionType, entityType, performedBy.getEmail());
        } catch (Exception e) {
            log.error("Failed to create audit log: {} {} by {}", actionType, entityType, performedBy != null ? performedBy.getEmail() : "unknown", e);
        }
    }

    @Async("emailTaskExecutor")
    public void logFailedAction(String actionType, String entityType, String entityId, User performedBy, Organization organization, String errorMessage) {
        try {
            AuditLog auditLog = new AuditLog(actionType, entityType, entityId, performedBy, organization);
            auditLog.setStatus(AuditLog.AuditStatus.FAILED);
            auditLog.setErrorMessage(errorMessage);
            auditLogRepository.save(auditLog);
            log.debug("Failed audit log created: {} {} by {}", actionType, entityType, performedBy != null ? performedBy.getEmail() : "unknown");
        } catch (Exception e) {
            log.error("Failed to create failed audit log: {} {} by {}", actionType, entityType, performedBy != null ? performedBy.getEmail() : "unknown", e);
        }
    }

    @Async("emailTaskExecutor")
    public void logActionWithMetadata(String actionType, String entityType, String entityId, User performedBy, Organization organization, String metadata) {
        try {
            AuditLog auditLog = new AuditLog(actionType, entityType, entityId, performedBy, organization);
            auditLog.setMetadata(metadata);
            auditLogRepository.save(auditLog);
            log.debug("Audit log created with metadata: {} {} by {}", actionType, entityType, performedBy.getEmail());
        } catch (Exception e) {
            log.error("Failed to create audit log with metadata: {} {} by {}", actionType, entityType, performedBy != null ? performedBy.getEmail() : "unknown", e);
        }
    }
}
