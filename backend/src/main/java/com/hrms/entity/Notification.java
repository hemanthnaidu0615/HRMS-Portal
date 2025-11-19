package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private Employee recipient;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // LEAVE_REQUEST, TIMESHEET_APPROVAL, PAYROLL_UPDATE, PERFORMANCE_REVIEW, SYSTEM_ANNOUNCEMENT, DOCUMENT_REQUEST, etc.

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Builder.Default
    @Column(name = "is_email_sent", nullable = false)
    private Boolean isEmailSent = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // JSON metadata for additional context
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    // Priority level: LOW, MEDIUM, HIGH, URGENT
    @Builder.Default
    @Column(name = "priority", length = 20)
    private String priority = "MEDIUM";

    // Category for grouping/filtering
    @Column(name = "category", length = 50)
    private String category; // APPROVAL, REMINDER, ANNOUNCEMENT, ALERT

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
        if (isEmailSent == null) {
            isEmailSent = false;
        }
    }

    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    public void markAsEmailSent() {
        this.isEmailSent = true;
    }
}
