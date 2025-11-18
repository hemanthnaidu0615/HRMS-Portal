package com.hrms.service.notification;

import com.hrms.entity.notification.NotificationTemplate;
import com.hrms.repository.notification.NotificationTemplateRepository;
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
public class NotificationTemplateService {

    private final NotificationTemplateRepository repository;

    public List<NotificationTemplate> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all NotificationTemplate for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<NotificationTemplate> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active NotificationTemplate for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public NotificationTemplate getById(UUID id, UUID organizationId) {
        log.debug("Fetching NotificationTemplate with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate not found with id: " + id));
    }

    public NotificationTemplate create(NotificationTemplate entity, UUID organizationId) {
        log.debug("Creating new NotificationTemplate for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public NotificationTemplate update(UUID id, NotificationTemplate entity, UUID organizationId) {
        log.debug("Updating NotificationTemplate with id: {} for organization: {}", id, organizationId);
        NotificationTemplate existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting NotificationTemplate with id: {} for organization: {}", id, organizationId);
        NotificationTemplate entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting NotificationTemplate with id: {} for organization: {}", id, organizationId);
        NotificationTemplate entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
