package com.hrms.entity.notification;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.*;
import java.math.BigDecimal;
import java.util.UUID;

import com.hrms.entity.*;

@Entity
@Table(name = "escalation_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EscalationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "module", nullable = false, length = 50)
    private String module;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "condition_type", length = 50)
    private String conditionType;

    @Column(name = "threshold_hours")
    private Integer thresholdHours;

    @Column(name = "escalation_level")
    private Integer escalationLevel = 1;

    @Column(name = "escalate_to_role", length = 50)
    private String escalateToRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escalate_to_user_id")
    private User escalateToUser;

    @Column(name = "notification_channel", length = 20)
    private String notificationChannel = "EMAIL";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_template_id")
    private NotificationTemplate notificationTemplate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (escalationLevel == null) {
            escalationLevel = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
