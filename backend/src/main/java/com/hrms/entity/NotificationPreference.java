package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType; // LEAVE_REQUEST, TIMESHEET_APPROVAL, PAYROLL_UPDATE, PERFORMANCE_REVIEW, SYSTEM_ANNOUNCEMENT

    @Builder.Default
    @Column(name = "email_enabled", nullable = false)
    private Boolean emailEnabled = true;

    @Builder.Default
    @Column(name = "in_app_enabled", nullable = false)
    private Boolean inAppEnabled = true;

    @Builder.Default
    @Column(name = "sms_enabled", nullable = false)
    private Boolean smsEnabled = false; // Future feature

    @Builder.Default
    @Column(name = "frequency", length = 20)
    private String frequency = "REALTIME"; // REALTIME, DAILY, WEEKLY

    @Column(name = "quiet_hours_start", length = 5)
    private String quietHoursStart; // HH:mm format, e.g., "22:00"

    @Column(name = "quiet_hours_end", length = 5)
    private String quietHoursEnd; // HH:mm format, e.g., "08:00"

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Check if notifications should be sent based on quiet hours
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

            // Handle overnight quiet hours (e.g., 22:00 to 08:00)
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
