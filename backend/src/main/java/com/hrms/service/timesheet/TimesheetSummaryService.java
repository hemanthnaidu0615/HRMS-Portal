package com.hrms.service.timesheet;

import com.hrms.entity.timesheet.TimesheetSummary;
import com.hrms.repository.timesheet.TimesheetSummaryRepository;
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
public class TimesheetSummaryService {

    private final TimesheetSummaryRepository repository;

    public List<TimesheetSummary> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all TimesheetSummary for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<TimesheetSummary> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active TimesheetSummary for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public TimesheetSummary getById(UUID id, UUID organizationId) {
        log.debug("Fetching TimesheetSummary with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("TimesheetSummary not found with id: " + id));
    }

    public TimesheetSummary create(TimesheetSummary entity, UUID organizationId) {
        log.debug("Creating new TimesheetSummary for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public TimesheetSummary update(UUID id, TimesheetSummary entity, UUID organizationId) {
        log.debug("Updating TimesheetSummary with id: {} for organization: {}", id, organizationId);
        TimesheetSummary existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting TimesheetSummary with id: {} for organization: {}", id, organizationId);
        TimesheetSummary entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting TimesheetSummary with id: {} for organization: {}", id, organizationId);
        TimesheetSummary entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
