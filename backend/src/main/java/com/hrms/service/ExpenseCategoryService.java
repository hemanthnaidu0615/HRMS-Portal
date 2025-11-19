package com.hrms.service;

import com.hrms.entity.ExpenseCategory;
import com.hrms.repository.ExpenseCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * ExpenseCategory Service
 * Module: EXPENSES
 */
@Service
@Transactional
public class ExpenseCategoryService {

    @Autowired
    private ExpenseCategoryRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<ExpenseCategory> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<ExpenseCategory> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<ExpenseCategory> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public ExpenseCategory create(ExpenseCategory entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public ExpenseCategory update(UUID id, ExpenseCategory updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("ExpenseCategory not found with id: " + id));
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
