package com.hrms.service;

import com.hrms.entity.LeaveBalance;
import com.hrms.repository.LeaveBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * LeaveBalance Service
 * Module: LEAVE
 */
@Service
@Transactional
public class LeaveBalanceService {

    @Autowired
    private LeaveBalanceRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<LeaveBalance> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<LeaveBalance> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<LeaveBalance> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public LeaveBalance create(LeaveBalance entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public LeaveBalance update(UUID id, LeaveBalance updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("LeaveBalance not found with id: " + id));
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
