package com.hrms.service;

import com.hrms.entity.PerformanceReview;
import com.hrms.repository.PerformanceReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * PerformanceReview Service
 * Module: PERFORMANCE
 */
@Service
@Transactional
public class PerformanceReviewService {

    @Autowired
    private PerformanceReviewRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<PerformanceReview> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<PerformanceReview> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<PerformanceReview> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public PerformanceReview create(PerformanceReview entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public PerformanceReview update(UUID id, PerformanceReview updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("PerformanceReview not found with id: " + id));
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
