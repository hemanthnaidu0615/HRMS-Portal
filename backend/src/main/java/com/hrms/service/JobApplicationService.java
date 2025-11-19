package com.hrms.service;

import com.hrms.entity.JobApplication;
import com.hrms.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JobApplication Service
 * Module: RECRUITMENT
 */
@Service
@Transactional
public class JobApplicationService {

    @Autowired
    private JobApplicationRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<JobApplication> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<JobApplication> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<JobApplication> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public JobApplication create(JobApplication entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public JobApplication update(UUID id, JobApplication updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("JobApplication not found with id: " + id));
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
