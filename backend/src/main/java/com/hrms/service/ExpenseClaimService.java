package com.hrms.service;

import com.hrms.entity.ExpenseClaim;
import com.hrms.repository.ExpenseClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * ExpenseClaim Service
 * Module: EXPENSES
 */
@Service
@Transactional
public class ExpenseClaimService {

    @Autowired
    private ExpenseClaimRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<ExpenseClaim> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<ExpenseClaim> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<ExpenseClaim> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public ExpenseClaim create(ExpenseClaim entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public ExpenseClaim update(UUID id, ExpenseClaim updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("ExpenseClaim not found with id: " + id));
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
