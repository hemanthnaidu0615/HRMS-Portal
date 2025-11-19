package com.hrms.service;

import com.hrms.entity.Payslip;
import com.hrms.repository.PayslipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Payslip Service
 * Module: PAYROLL
 */
@Service
@Transactional
public class PayslipService {

    @Autowired
    private PayslipRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<Payslip> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<Payslip> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<Payslip> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public Payslip create(Payslip entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public Payslip update(UUID id, Payslip updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("Payslip not found with id: " + id));
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
