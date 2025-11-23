package com.hrms.controller.notification;

import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.entity.notification.Notification;
import com.hrms.repository.EmployeeRepository;
import com.hrms.security.JwtAuthenticationFilter;
import com.hrms.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for user-facing notification endpoints
 * Provides endpoints for authenticated users to access their own notifications
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserNotificationController {

    private final NotificationService notificationService;
    private final EmployeeRepository employeeRepository;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Get recent notifications for the current user
     * @return List of recent notifications
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Notification>> getRecentNotifications(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        log.debug("GET /api/notifications/recent - userId: {}", userId);

        // Find employee by user ID - return empty list if no employee record yet
        Employee employee = employeeRepository.findByUser_Id(userId)
                .orElse(null);

        if (employee == null) {
            log.debug("No employee record found for user {}, returning empty notifications", userId);
            return ResponseEntity.ok(List.of());
        }

        List<Notification> notifications = notificationService.getRecentNotificationsByEmployee(employee.getId());
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count for the current user
     * @return Map with unread count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        log.debug("GET /api/notifications/unread-count - userId: {}", userId);

        // Find employee by user ID - return 0 count if no employee record yet
        Employee employee = employeeRepository.findByUser_Id(userId)
                .orElse(null);

        long count = 0;
        if (employee != null) {
            count = notificationService.getUnreadCountByEmployee(employee.getId());
        } else {
            log.debug("No employee record found for user {}, returning 0 unread count", userId);
        }

        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all unread notifications for the current user
     * @return List of unread notifications
     */
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        log.debug("GET /api/notifications/unread - userId: {}", userId);

        // Find employee by user ID - return empty list if no employee record yet
        Employee employee = employeeRepository.findByUser_Id(userId)
                .orElse(null);

        if (employee == null) {
            log.debug("No employee record found for user {}, returning empty notifications", userId);
            return ResponseEntity.ok(List.of());
        }

        List<Notification> notifications = notificationService.getUnreadNotificationsByEmployee(employee.getId());
        return ResponseEntity.ok(notifications);
    }

    /**
     * Mark a notification as read
     * @param id Notification ID
     * @return Success response
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, HttpServletRequest request) {
        UUID userId = jwtAuthenticationFilter.getUserId(request);
        log.debug("PUT /api/notifications/{}/read - userId: {}", id, userId);

        // Find employee by user ID
        Employee employee = employeeRepository.findByUser_Id(userId)
                .orElse(null);

        if (employee == null) {
            log.warn("Cannot mark notification as read - no employee record for user {}", userId);
            return ResponseEntity.status(404).build();
        }

        notificationService.markAsRead(id, employee.getId());
        return ResponseEntity.ok().build();
    }
}
