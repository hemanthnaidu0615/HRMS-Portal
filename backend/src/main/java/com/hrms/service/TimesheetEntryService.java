package com.hrms.service;

import com.hrms.entity.TimesheetEntry;
import com.hrms.repository.TimesheetEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * TimesheetEntry Service
 * Module: TIMESHEET
 */
@Service
@Transactional
public class TimesheetEntryService {

    @Autowired
    private TimesheetEntryRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<TimesheetEntry> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<TimesheetEntry> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<TimesheetEntry> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public TimesheetEntry create(TimesheetEntry entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public TimesheetEntry update(UUID id, TimesheetEntry updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("TimesheetEntry not found with id: " + id));
    }

    /**
     * Delete record
     */
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    /**
     * Count records by organization
     */
    public Long countByOrganization(UUID organizationId) {
        return repository.countByOrganizationId(organizationId);
    }
}
