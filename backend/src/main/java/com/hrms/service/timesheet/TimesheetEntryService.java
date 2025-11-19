package com.hrms.service.timesheet;

import com.hrms.entity.timesheet.TimesheetEntry;
import com.hrms.repository.timesheet.TimesheetEntryRepository;
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
public class TimesheetEntryService {

    private final TimesheetEntryRepository repository;

    public List<TimesheetEntry> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all TimesheetEntry for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<TimesheetEntry> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active TimesheetEntry for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public TimesheetEntry getById(UUID id, UUID organizationId) {
        log.debug("Fetching TimesheetEntry with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("TimesheetEntry not found with id: " + id));
    }

    public TimesheetEntry create(TimesheetEntry entity, UUID organizationId) {
        log.debug("Creating new TimesheetEntry for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public TimesheetEntry update(UUID id, TimesheetEntry entity, UUID organizationId) {
        log.debug("Updating TimesheetEntry with id: {} for organization: {}", id, organizationId);
        TimesheetEntry existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting TimesheetEntry with id: {} for organization: {}", id, organizationId);
        TimesheetEntry entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting TimesheetEntry with id: {} for organization: {}", id, organizationId);
        TimesheetEntry entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
