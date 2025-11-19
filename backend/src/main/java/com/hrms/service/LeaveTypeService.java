package com.hrms.service;

import com.hrms.entity.LeaveType;
import com.hrms.repository.LeaveTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * LeaveType Service
 * Module: LEAVE
 */
@Service
@Transactional
public class LeaveTypeService {

    @Autowired
    private LeaveTypeRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<LeaveType> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<LeaveType> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<LeaveType> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public LeaveType create(LeaveType entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public LeaveType update(UUID id, LeaveType updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("LeaveType not found with id: " + id));
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
