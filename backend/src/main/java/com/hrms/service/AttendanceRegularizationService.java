package com.hrms.service;

import com.hrms.entity.AttendanceRegularization;
import com.hrms.repository.AttendanceRegularizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * AttendanceRegularization Service
 * Module: ATTENDANCE
 */
@Service
@Transactional
public class AttendanceRegularizationService {

    @Autowired
    private AttendanceRegularizationRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<AttendanceRegularization> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<AttendanceRegularization> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<AttendanceRegularization> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public AttendanceRegularization create(AttendanceRegularization entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public AttendanceRegularization update(UUID id, AttendanceRegularization updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("AttendanceRegularization not found with id: " + id));
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
