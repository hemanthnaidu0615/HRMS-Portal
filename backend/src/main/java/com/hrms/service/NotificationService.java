package com.hrms.service;

import com.hrms.entity.Employee;
import com.hrms.entity.Notification;
import com.hrms.entity.NotificationPreference;
import com.hrms.repository.NotificationPreferenceRepository;
import com.hrms.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final EmailService emailService;

    // Notification types constants
    public static final String TYPE_LEAVE_REQUEST = "LEAVE_REQUEST";
    public static final String TYPE_TIMESHEET_APPROVAL = "TIMESHEET_APPROVAL";
    public static final String TYPE_PAYROLL_UPDATE = "PAYROLL_UPDATE";
    public static final String TYPE_PERFORMANCE_REVIEW = "PERFORMANCE_REVIEW";
    public static final String TYPE_SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT";
    public static final String TYPE_DOCUMENT_REQUEST = "DOCUMENT_REQUEST";
    public static final String TYPE_DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD";
    public static final String TYPE_ASSIGNMENT_CHANGE = "ASSIGNMENT_CHANGE";
    public static final String TYPE_MENTION = "MENTION";

    // Categories
    public static final String CATEGORY_APPROVAL = "APPROVAL";
    public static final String CATEGORY_REMINDER = "REMINDER";
    public static final String CATEGORY_ANNOUNCEMENT = "ANNOUNCEMENT";
    public static final String CATEGORY_ALERT = "ALERT";

    /**
     * Create a notification with automatic email sending based on preferences
     */
    @Transactional
    public Notification createNotification(Employee recipient, String type, String title, String message, String actionUrl) {
        return createNotification(recipient, type, title, message, actionUrl, "MEDIUM", null, null);
    }

    /**
     * Create a notification with full control over all parameters
     */
    @Transactional
    public Notification createNotification(Employee recipient, String type, String title, String message,
                                          String actionUrl, String priority, String category, Map<String, Object> metadata) {
        // Create in-app notification
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .actionUrl(actionUrl)
                .priority(priority != null ? priority : "MEDIUM")
                .category(category)
                .isRead(false)
                .isEmailSent(false)
                .build();

        if (metadata != null && !metadata.isEmpty()) {
            // Convert metadata to JSON string (simple implementation)
            notification.setMetadata(convertMetadataToJson(metadata));
        }

        notification = notificationRepository.save(notification);
        log.info("Created notification for employee {} with type {}", recipient.getId(), type);

        // Check preferences and send email if enabled
        sendEmailIfEnabled(recipient, type, title, message, actionUrl, notification);

        return notification;
    }

    /**
     * Send email based on user preferences
     */
    @Async
    protected void sendEmailIfEnabled(Employee recipient, String type, String title, String message,
                                     String actionUrl, Notification notification) {
        try {
            Optional<NotificationPreference> preferenceOpt = notificationPreferenceRepository
                    .findByEmployeeAndNotificationType(recipient, type);

            // Default to sending email if no preference is set
            boolean shouldSendEmail = true;
            boolean isInQuietHours = false;

            if (preferenceOpt.isPresent()) {
                NotificationPreference preference = preferenceOpt.get();
                shouldSendEmail = preference.getEmailEnabled();
                isInQuietHours = preference.isInQuietHours();
            }

            if (shouldSendEmail && !isInQuietHours && recipient.getUser() != null) {
                String email = recipient.getUser().getEmail();
                emailService.sendGenericNotificationEmail(email, title, message, actionUrl);
                notification.markAsEmailSent();
                notificationRepository.save(notification);
                log.info("Email sent for notification {} to {}", notification.getId(), email);
            }
        } catch (Exception e) {
            log.error("Failed to send email for notification {}", notification.getId(), e);
        }
    }

    /**
     * Get paginated notifications for a recipient
     */
    public Page<Notification> getNotifications(Employee recipient, Pageable pageable) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient, pageable);
    }

    /**
     * Get unread notifications for a recipient
     */
    public Page<Notification> getUnreadNotifications(Employee recipient, Pageable pageable) {
        return notificationRepository.findByRecipientAndIsReadOrderByCreatedAtDesc(recipient, false, pageable);
    }

    /**
     * Get notifications by type
     */
    public Page<Notification> getNotificationsByType(Employee recipient, String type, Pageable pageable) {
        return notificationRepository.findByRecipientAndTypeOrderByCreatedAtDesc(recipient, type, pageable);
    }

    /**
     * Get notifications by category
     */
    public Page<Notification> getNotificationsByCategory(Employee recipient, String category, Pageable pageable) {
        return notificationRepository.findByRecipientAndCategoryOrderByCreatedAtDesc(recipient, category, pageable);
    }

    /**
     * Get recent notifications (top 5)
     */
    public List<Notification> getRecentNotifications(Employee recipient) {
        return notificationRepository.findTop5ByRecipientOrderByCreatedAtDesc(recipient);
    }

    /**
     * Get unread count
     */
    public Integer getUnreadCount(Employee recipient) {
        Integer count = notificationRepository.countUnreadByRecipient(recipient);
        return count != null ? count : 0;
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(UUID notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.markAsRead();
            notificationRepository.save(notification);
            log.info("Marked notification {} as read", notificationId);
        }
    }

    /**
     * Mark all notifications as read for a recipient
     */
    @Transactional
    public void markAllAsRead(Employee recipient) {
        notificationRepository.markAllAsReadByRecipient(recipient, LocalDateTime.now());
        log.info("Marked all notifications as read for employee {}", recipient.getId());
    }

    /**
     * Delete notification
     */
    @Transactional
    public void deleteNotification(UUID notificationId) {
        notificationRepository.deleteById(notificationId);
        log.info("Deleted notification {}", notificationId);
    }

    /**
     * Delete old notifications (older than specified days)
     */
    @Transactional
    public void deleteOldNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        notificationRepository.deleteOldNotifications(cutoffDate);
        log.info("Deleted notifications older than {} days", daysOld);
    }

    // Preference Management

    /**
     * Get all preferences for an employee
     */
    public List<NotificationPreference> getPreferences(Employee employee) {
        return notificationPreferenceRepository.findByEmployee(employee);
    }

    /**
     * Get preference for a specific type
     */
    public Optional<NotificationPreference> getPreference(Employee employee, String notificationType) {
        return notificationPreferenceRepository.findByEmployeeAndNotificationType(employee, notificationType);
    }

    /**
     * Update or create a notification preference
     */
    @Transactional
    public NotificationPreference updatePreference(Employee employee, String notificationType,
                                                   Boolean emailEnabled, Boolean inAppEnabled,
                                                   Boolean smsEnabled, String frequency,
                                                   String quietHoursStart, String quietHoursEnd) {
        Optional<NotificationPreference> existingPref = notificationPreferenceRepository
                .findByEmployeeAndNotificationType(employee, notificationType);

        NotificationPreference preference;
        if (existingPref.isPresent()) {
            preference = existingPref.get();
        } else {
            preference = NotificationPreference.builder()
                    .employee(employee)
                    .notificationType(notificationType)
                    .build();
        }

        if (emailEnabled != null) preference.setEmailEnabled(emailEnabled);
        if (inAppEnabled != null) preference.setInAppEnabled(inAppEnabled);
        if (smsEnabled != null) preference.setSmsEnabled(smsEnabled);
        if (frequency != null) preference.setFrequency(frequency);
        if (quietHoursStart != null) preference.setQuietHoursStart(quietHoursStart);
        if (quietHoursEnd != null) preference.setQuietHoursEnd(quietHoursEnd);

        preference = notificationPreferenceRepository.save(preference);
        log.info("Updated notification preference for employee {} and type {}", employee.getId(), notificationType);

        return preference;
    }

    /**
     * Initialize default preferences for a new employee
     */
    @Transactional
    public void initializeDefaultPreferences(Employee employee) {
        List<String> notificationTypes = Arrays.asList(
                TYPE_LEAVE_REQUEST,
                TYPE_TIMESHEET_APPROVAL,
                TYPE_PAYROLL_UPDATE,
                TYPE_PERFORMANCE_REVIEW,
                TYPE_SYSTEM_ANNOUNCEMENT,
                TYPE_DOCUMENT_REQUEST
        );

        for (String type : notificationTypes) {
            if (!notificationPreferenceRepository.existsByEmployeeAndNotificationType(employee, type)) {
                NotificationPreference preference = NotificationPreference.builder()
                        .employee(employee)
                        .notificationType(type)
                        .emailEnabled(true)
                        .inAppEnabled(true)
                        .smsEnabled(false)
                        .frequency("REALTIME")
                        .build();
                notificationPreferenceRepository.save(preference);
            }
        }
        log.info("Initialized default notification preferences for employee {}", employee.getId());
    }

    // Helper methods for specific notification types

    /**
     * Send leave request notification
     */
    public void sendLeaveRequestNotification(Employee recipient, String leaveType, String startDate,
                                            String endDate, String status, String actionUrl) {
        String title = "Leave Request " + status;
        String message = String.format("Your %s leave request from %s to %s has been %s",
                leaveType, startDate, endDate, status.toLowerCase());

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("leaveType", leaveType);
        metadata.put("startDate", startDate);
        metadata.put("endDate", endDate);
        metadata.put("status", status);

        createNotification(recipient, TYPE_LEAVE_REQUEST, title, message, actionUrl,
                "HIGH", CATEGORY_APPROVAL, metadata);

        // Send specific leave email
        if (recipient.getUser() != null) {
            emailService.sendLeaveApprovalEmail(recipient.getUser().getEmail(),
                    recipient.getFullName(), leaveType, startDate, endDate, status);
        }
    }

    /**
     * Send timesheet approval notification
     */
    public void sendTimesheetApprovalNotification(Employee recipient, String period, String status, String actionUrl) {
        String title = "Timesheet " + status;
        String message = String.format("Your timesheet for %s has been %s", period, status.toLowerCase());

        createNotification(recipient, TYPE_TIMESHEET_APPROVAL, title, message, actionUrl,
                "MEDIUM", CATEGORY_APPROVAL, null);
    }

    /**
     * Send payroll notification
     */
    public void sendPayrollNotification(Employee recipient, String month, String netPay, String actionUrl) {
        String title = "Payslip Available - " + month;
        String message = String.format("Your payslip for %s is now available. Net Pay: %s", month, netPay);

        createNotification(recipient, TYPE_PAYROLL_UPDATE, title, message, actionUrl,
                "HIGH", CATEGORY_ANNOUNCEMENT, null);

        // Send specific payroll email
        if (recipient.getUser() != null) {
            emailService.sendPayrollGeneratedEmail(recipient.getUser().getEmail(),
                    recipient.getFullName(), month, netPay);
        }
    }

    /**
     * Send performance review notification
     */
    public void sendPerformanceReviewNotification(Employee recipient, String reviewType, String actionUrl) {
        String title = "Performance Review Available";
        String message = String.format("Your %s performance review is ready for your review", reviewType);

        createNotification(recipient, TYPE_PERFORMANCE_REVIEW, title, message, actionUrl,
                "MEDIUM", CATEGORY_ANNOUNCEMENT, null);
    }

    /**
     * Send system announcement
     */
    public void sendSystemAnnouncement(Employee recipient, String title, String message, String actionUrl) {
        createNotification(recipient, TYPE_SYSTEM_ANNOUNCEMENT, title, message, actionUrl,
                "LOW", CATEGORY_ANNOUNCEMENT, null);
    }

    /**
     * Simple metadata to JSON converter
     */
    private String convertMetadataToJson(Map<String, Object> metadata) {
        StringBuilder json = new StringBuilder("{");
        Iterator<Map.Entry<String, Object>> iterator = metadata.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Object> entry = iterator.next();
            json.append("\"").append(entry.getKey()).append("\":\"")
                .append(entry.getValue()).append("\"");
            if (iterator.hasNext()) {
                json.append(",");
            }
        }
        json.append("}");
        return json.toString();
    }
}
