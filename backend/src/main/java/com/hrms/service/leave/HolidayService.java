package com.hrms.service.leave;

import com.hrms.entity.leave.Holiday;
import com.hrms.repository.leave.HolidayRepository;
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
public class HolidayService {

    private final HolidayRepository repository;

    public List<Holiday> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all Holiday for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<Holiday> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active Holiday for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public Holiday getById(UUID id, UUID organizationId) {
        log.debug("Fetching Holiday with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with id: " + id));
    }

    public Holiday create(Holiday entity, UUID organizationId) {
        log.debug("Creating new Holiday for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public Holiday update(UUID id, Holiday entity, UUID organizationId) {
        log.debug("Updating Holiday with id: {} for organization: {}", id, organizationId);
        Holiday existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting Holiday with id: {} for organization: {}", id, organizationId);
        Holiday entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting Holiday with id: {} for organization: {}", id, organizationId);
        Holiday entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
