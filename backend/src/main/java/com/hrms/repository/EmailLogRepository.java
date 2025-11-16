package com.hrms.repository;

import com.hrms.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, UUID> {
    List<EmailLog> findByRecipientEmailOrderBySentAtDesc(String recipientEmail);
    List<EmailLog> findByEmailTypeOrderBySentAtDesc(String emailType);
    List<EmailLog> findByStatusOrderBySentAtDesc(EmailLog.EmailStatus status);
    List<EmailLog> findBySentAtBetweenOrderBySentAtDesc(LocalDateTime start, LocalDateTime end);
    List<EmailLog> findByRelatedEntityIdAndRelatedEntityTypeOrderBySentAtDesc(String relatedEntityId, String relatedEntityType);
}
