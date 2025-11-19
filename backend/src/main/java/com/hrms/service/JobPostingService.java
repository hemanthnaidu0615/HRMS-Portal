package com.hrms.service;

import com.hrms.entity.JobPosting;
import com.hrms.repository.JobPostingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JobPosting Service
 * Module: RECRUITMENT
 */
@Service
@Transactional
public class JobPostingService {

    @Autowired
    private JobPostingRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<JobPosting> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<JobPosting> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<JobPosting> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public JobPosting create(JobPosting entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public JobPosting update(UUID id, JobPosting updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("JobPosting not found with id: " + id));
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
