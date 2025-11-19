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
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

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

    // NotificationPreference specific fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType;

    @Column(name = "email_enabled", nullable = false)
    private Boolean emailEnabled = true;

    @Column(name = "in_app_enabled", nullable = false)
    private Boolean inAppEnabled = true;

    @Column(name = "sms_enabled", nullable = false)
    private Boolean smsEnabled = false;

    @Column(name = "frequency", length = 20)
    private String frequency = "REALTIME";

    @Column(name = "quiet_hours_start", length = 5)
    private String quietHoursStart;

    @Column(name = "quiet_hours_end", length = 5)
    private String quietHoursEnd;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isInQuietHours() {
        if (quietHoursStart == null || quietHoursEnd == null) {
            return false;
        }

        try {
            LocalDateTime now = LocalDateTime.now();
            int currentHour = now.getHour();
            int currentMinute = now.getMinute();
            int currentTimeInMinutes = currentHour * 60 + currentMinute;

            String[] startParts = quietHoursStart.split(":");
            int startTimeInMinutes = Integer.parseInt(startParts[0]) * 60 + Integer.parseInt(startParts[1]);

            String[] endParts = quietHoursEnd.split(":");
            int endTimeInMinutes = Integer.parseInt(endParts[0]) * 60 + Integer.parseInt(endParts[1]);

            if (startTimeInMinutes > endTimeInMinutes) {
                return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
            } else {
                return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
            }
        } catch (Exception e) {
            return false;
        }
    }
}
