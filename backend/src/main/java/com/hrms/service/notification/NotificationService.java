package com.hrms.service.notification;

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
}
