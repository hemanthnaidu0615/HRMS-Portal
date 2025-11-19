package com.hrms.service;

import com.hrms.entity.AssetAssignment;
import com.hrms.repository.AssetAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * AssetAssignment Service
 * Module: ASSETS
 */
@Service
@Transactional
public class AssetAssignmentService {

    @Autowired
    private AssetAssignmentRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<AssetAssignment> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<AssetAssignment> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<AssetAssignment> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public AssetAssignment create(AssetAssignment entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public AssetAssignment update(UUID id, AssetAssignment updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("AssetAssignment not found with id: " + id));
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
