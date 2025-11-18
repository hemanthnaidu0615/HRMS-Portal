package com.hrms.repository;

import com.hrms.entity.Employee;
import com.hrms.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByRecipientOrderByCreatedAtDesc(Employee recipient, Pageable pageable);

    Page<Notification> findByRecipientAndIsReadOrderByCreatedAtDesc(Employee recipient, Boolean isRead, Pageable pageable);

    Page<Notification> findByRecipientAndTypeOrderByCreatedAtDesc(Employee recipient, String type, Pageable pageable);

    Page<Notification> findByRecipientAndCategoryOrderByCreatedAtDesc(Employee recipient, String category, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient = :recipient AND n.isRead = false")
    Integer countUnreadByRecipient(@Param("recipient") Employee recipient);

    List<Notification> findTop5ByRecipientOrderByCreatedAtDesc(Employee recipient);

    List<Notification> findTop10ByRecipientAndIsReadFalseOrderByCreatedAtDesc(Employee recipient);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipient = :recipient AND n.isRead = false")
    void markAllAsReadByRecipient(@Param("recipient") Employee recipient, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :before")
    void deleteOldNotifications(@Param("before") LocalDateTime before);

    List<Notification> findByRecipientAndIsReadFalseAndIsEmailSentFalse(Employee recipient);
}
