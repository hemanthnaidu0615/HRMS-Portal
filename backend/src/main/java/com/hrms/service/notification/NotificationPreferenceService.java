package com.hrms.service.notification;

import com.hrms.entity.notification.NotificationPreference;
import com.hrms.repository.notification.NotificationPreferenceRepository;
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
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository repository;

    public List<NotificationPreference> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all NotificationPreference for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<NotificationPreference> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active NotificationPreference for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public NotificationPreference getById(UUID id, UUID organizationId) {
        log.debug("Fetching NotificationPreference with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationPreference not found with id: " + id));
    }

    public NotificationPreference create(NotificationPreference entity, UUID organizationId) {
        log.debug("Creating new NotificationPreference for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public NotificationPreference update(UUID id, NotificationPreference entity, UUID organizationId) {
        log.debug("Updating NotificationPreference with id: {} for organization: {}", id, organizationId);
        NotificationPreference existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting NotificationPreference with id: {} for organization: {}", id, organizationId);
        NotificationPreference entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting NotificationPreference with id: {} for organization: {}", id, organizationId);
        NotificationPreference entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
