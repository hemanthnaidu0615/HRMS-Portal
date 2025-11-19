package com.hrms.service;

import com.hrms.entity.Shift;
import com.hrms.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Shift Service
 * Module: ATTENDANCE
 */
@Service
@Transactional
public class ShiftService {

    @Autowired
    private ShiftRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<Shift> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<Shift> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<Shift> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public Shift create(Shift entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public Shift update(UUID id, Shift updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("Shift not found with id: " + id));
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
