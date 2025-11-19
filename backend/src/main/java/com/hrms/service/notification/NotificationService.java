package com.hrms.service.notification;

import com.hrms.entity.Employee;
import com.hrms.entity.notification.Notification;
import com.hrms.repository.notification.NotificationRepository;
import com.hrms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository repository;

    public List<Notification> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all Notification for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<Notification> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active Notification for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public Notification getById(UUID id, UUID organizationId) {
        log.debug("Fetching Notification with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }

    public Notification create(Notification entity, UUID organizationId) {
        log.debug("Creating new Notification for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public Notification update(UUID id, Notification entity, UUID organizationId) {
        log.debug("Updating Notification with id: {} for organization: {}", id, organizationId);
        Notification existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting Notification with id: {} for organization: {}", id, organizationId);
        Notification entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting Notification with id: {} for organization: {}", id, organizationId);
        Notification entity = getById(id, organizationId);
        repository.delete(entity);
    }

    /**
     * Convenience method to create a notification for an employee
     * @param employee The employee to notify
     * @param type The notification type (REMINDER, INFO, WARNING, ERROR, etc.)
     * @param title The notification title
     * @param message The notification message
     * @param link Optional link for the notification
     * @return The created notification
     */
    public Notification createNotification(Employee employee, String type, String title, String message, String link) {
        log.debug("Creating notification for employee: {} with type: {}", employee.getId(), type);

        Notification notification = new Notification();
        notification.setEmployee(employee);
        notification.setOrganization(employee.getOrganization());
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        notification.setIsRead(false);
        notification.setIsActive(true);

        return repository.save(notification);
    }

    /**
     * Deletes notifications older than specified number of days
     * @param daysToKeep Number of days to keep notifications
     * @return Number of deleted notifications
     */
    public int deleteOldNotifications(int daysToKeep) {
        log.debug("Deleting notifications older than {} days", daysToKeep);

        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        List<Notification> oldNotifications = repository.findByCreatedAtBeforeAndDeletedAtIsNull(cutoffDate);

        int count = 0;
        for (Notification notification : oldNotifications) {
            notification.setDeletedAt(LocalDateTime.now());
            notification.setIsActive(false);
            repository.save(notification);
            count++;
        }

        log.info("Deleted {} old notifications", count);
        return count;
    }

    /**
     * Get recent notifications for an employee (limited to 10)
     * @param employeeId The employee ID
     * @return List of recent notifications
     */
    public List<Notification> getRecentNotificationsByEmployee(UUID employeeId) {
        log.debug("Fetching recent notifications for employee: {}", employeeId);
        List<Notification> notifications = repository.findByEmployeeIdAndDeletedAtIsNullOrderByCreatedAtDesc(employeeId);
        // Limit to 10 most recent
        return notifications.stream().limit(10).toList();
    }

    /**
     * Get unread notification count for an employee
     * @param employeeId The employee ID
     * @return Count of unread notifications
     */
    public long getUnreadCountByEmployee(UUID employeeId) {
        log.debug("Fetching unread count for employee: {}", employeeId);
        return repository.countByEmployeeIdAndIsReadFalseAndDeletedAtIsNull(employeeId);
    }

    /**
     * Get all unread notifications for an employee
     * @param employeeId The employee ID
     * @return List of unread notifications
     */
    public List<Notification> getUnreadNotificationsByEmployee(UUID employeeId) {
        log.debug("Fetching unread notifications for employee: {}", employeeId);
        return repository.findByEmployeeIdAndIsReadFalseAndDeletedAtIsNullOrderByCreatedAtDesc(employeeId);
    }

    /**
     * Mark a notification as read
     * @param id Notification ID
     * @param employeeId Employee ID
     */
    public void markAsRead(UUID id, UUID employeeId) {
        log.debug("Marking notification {} as read for employee: {}", id, employeeId);
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        if (!notification.getEmployee().getId().equals(employeeId)) {
            throw new ResourceNotFoundException("Notification not found for this employee");
        }

        notification.markAsRead();
        repository.save(notification);
    }
}
