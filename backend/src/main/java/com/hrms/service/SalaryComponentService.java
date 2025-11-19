package com.hrms.service;

import com.hrms.entity.SalaryComponent;
import com.hrms.repository.SalaryComponentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * SalaryComponent Service
 * Module: PAYROLL
 */
@Service
@Transactional
public class SalaryComponentService {

    @Autowired
    private SalaryComponentRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<SalaryComponent> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<SalaryComponent> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<SalaryComponent> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public SalaryComponent create(SalaryComponent entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public SalaryComponent update(UUID id, SalaryComponent updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("SalaryComponent not found with id: " + id));
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
