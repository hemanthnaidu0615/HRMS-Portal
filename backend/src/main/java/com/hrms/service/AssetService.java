package com.hrms.service;

import com.hrms.entity.Asset;
import com.hrms.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Asset Service
 * Module: ASSETS
 */
@Service
@Transactional
public class AssetService {

    @Autowired
    private AssetRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<Asset> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<Asset> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<Asset> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public Asset create(Asset entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public Asset update(UUID id, Asset updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));
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
