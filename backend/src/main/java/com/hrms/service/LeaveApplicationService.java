package com.hrms.service;

import com.hrms.entity.LeaveApplication;
import com.hrms.repository.LeaveApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * LeaveApplication Service
 * Module: LEAVE
 */
@Service
@Transactional
public class LeaveApplicationService {

    @Autowired
    private LeaveApplicationRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<LeaveApplication> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<LeaveApplication> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<LeaveApplication> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public LeaveApplication create(LeaveApplication entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public LeaveApplication update(UUID id, LeaveApplication updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("LeaveApplication not found with id: " + id));
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
