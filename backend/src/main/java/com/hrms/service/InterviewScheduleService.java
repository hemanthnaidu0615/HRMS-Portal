package com.hrms.service;

import com.hrms.entity.InterviewSchedule;
import com.hrms.repository.InterviewScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * InterviewSchedule Service
 * Module: RECRUITMENT
 */
@Service
@Transactional
public class InterviewScheduleService {

    @Autowired
    private InterviewScheduleRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<InterviewSchedule> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<InterviewSchedule> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<InterviewSchedule> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public InterviewSchedule create(InterviewSchedule entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public InterviewSchedule update(UUID id, InterviewSchedule updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("InterviewSchedule not found with id: " + id));
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
