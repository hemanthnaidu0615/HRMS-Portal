package com.hrms.service.notification;

import com.hrms.entity.notification.Reminder;
import com.hrms.repository.notification.ReminderRepository;
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
public class ReminderService {

    private final ReminderRepository repository;

    public List<Reminder> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all Reminder for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<Reminder> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active Reminder for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public Reminder getById(UUID id, UUID organizationId) {
        log.debug("Fetching Reminder with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));
    }

    public Reminder create(Reminder entity, UUID organizationId) {
        log.debug("Creating new Reminder for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public Reminder update(UUID id, Reminder entity, UUID organizationId) {
        log.debug("Updating Reminder with id: {} for organization: {}", id, organizationId);
        Reminder existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting Reminder with id: {} for organization: {}", id, organizationId);
        Reminder entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting Reminder with id: {} for organization: {}", id, organizationId);
        Reminder entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
