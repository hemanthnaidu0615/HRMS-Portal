package com.hrms.service;

import com.hrms.entity.PayrollRun;
import com.hrms.repository.PayrollRunRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * PayrollRun Service
 * Module: PAYROLL
 */
@Service
@Transactional
public class PayrollRunService {

    @Autowired
    private PayrollRunRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<PayrollRun> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<PayrollRun> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<PayrollRun> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public PayrollRun create(PayrollRun entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public PayrollRun update(UUID id, PayrollRun updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("PayrollRun not found with id: " + id));
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
