package com.hrms.service;

import com.hrms.entity.EmployeeGoal;
import com.hrms.repository.EmployeeGoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * EmployeeGoal Service
 * Module: PERFORMANCE
 */
@Service
@Transactional
public class EmployeeGoalService {

    @Autowired
    private EmployeeGoalRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<EmployeeGoal> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<EmployeeGoal> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<EmployeeGoal> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public EmployeeGoal create(EmployeeGoal entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public EmployeeGoal update(UUID id, EmployeeGoal updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("EmployeeGoal not found with id: " + id));
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
