package com.hrms.controller;

import com.hrms.entity.Employee;
import com.hrms.entity.Notification;
import com.hrms.entity.NotificationPreference;
import com.hrms.entity.User;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.NotificationService;
import com.hrms.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;
    private final EmployeeRepository employeeRepository;

    /**
     * Get paginated notifications
     */
    @GetMapping
    public ResponseEntity<Page<Notification>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean unreadOnly,
            Authentication authentication) {

        User user = userService.getCurrentUser(authentication);
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications;

        if (unreadOnly != null && unreadOnly) {
            notifications = notificationService.getUnreadNotifications(employee, pageable);
        } else if (type != null && !type.isEmpty()) {
            notifications = notificationService.getNotificationsByType(employee, type, pageable);
        } else if (category != null && !category.isEmpty()) {
            notifications = notificationService.getNotificationsByCategory(employee, category, pageable);
        } else {
            notifications = notificationService.getNotifications(employee, pageable);
        }

        return ResponseEntity.ok(notifications);
    }

    /**
     * Get recent notifications (top 5 for dropdown)
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Notification>> getRecentNotifications(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<Notification> notifications = notificationService.getRecentNotifications(employee);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Integer count = notificationService.getUnreadCount(employee);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, Authentication authentication) {
        // Verify notification belongs to current user
        User user = userService.getCurrentUser(authentication);
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        notificationService.markAllAsRead(employee);
        return ResponseEntity.ok().build();
    }

    /**
     * Delete notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID id, Authentication authentication) {
        // Verify notification belongs to current user
        User user = userService.getCurrentUser(authentication);
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Get notification preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<List<NotificationPreference>> getPreferences(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<NotificationPreference> preferences = notificationService.getPreferences(employee);

        // If no preferences exist, initialize defaults
        if (preferences.isEmpty()) {
            notificationService.initializeDefaultPreferences(employee);
            preferences = notificationService.getPreferences(employee);
        }

        return ResponseEntity.ok(preferences);
    }

    /**
     * Update notification preference
     */
    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreference> updatePreference(
            @RequestBody NotificationPreferenceRequest request,
            Authentication authentication) {

        User user = userService.getCurrentUser(authentication);
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        NotificationPreference preference = notificationService.updatePreference(
                employee,
                request.notificationType,
                request.emailEnabled,
                request.inAppEnabled,
                request.smsEnabled,
                request.frequency,
                request.quietHoursStart,
                request.quietHoursEnd
        );

        return ResponseEntity.ok(preference);
    }

    /**
     * Bulk update notification preferences
     */
    @PutMapping("/preferences/bulk")
    public ResponseEntity<List<NotificationPreference>> bulkUpdatePreferences(
            @RequestBody List<NotificationPreferenceRequest> requests,
            Authentication authentication) {

        User user = userService.getCurrentUser(authentication);
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<NotificationPreference> updatedPreferences = new ArrayList<>();

        for (NotificationPreferenceRequest request : requests) {
            NotificationPreference preference = notificationService.updatePreference(
                    employee,
                    request.notificationType,
                    request.emailEnabled,
                    request.inAppEnabled,
                    request.smsEnabled,
                    request.frequency,
                    request.quietHoursStart,
                    request.quietHoursEnd
            );
            updatedPreferences.add(preference);
        }

        return ResponseEntity.ok(updatedPreferences);
    }

    /**
     * Get notification stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getNotificationStats(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Integer unreadCount = notificationService.getUnreadCount(employee);
        List<Notification> recent = notificationService.getRecentNotifications(employee);

        Map<String, Object> stats = new HashMap<>();
        stats.put("unreadCount", unreadCount);
        stats.put("recentCount", recent.size());

        return ResponseEntity.ok(stats);
    }

    /**
     * Request DTO for notification preference updates
     */
    public static class NotificationPreferenceRequest {
        public String notificationType;
        public Boolean emailEnabled;
        public Boolean inAppEnabled;
        public Boolean smsEnabled;
        public String frequency;
        public String quietHoursStart;
        public String quietHoursEnd;
    }
}
