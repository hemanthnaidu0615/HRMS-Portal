package com.hrms.service.recruitment;

import com.hrms.entity.recruitment.JobPosting;
import com.hrms.repository.recruitment.JobPostingRepository;
import com.hrms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class JobPostingService {

    private final JobPostingRepository repository;

    public List<JobPosting> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all JobPosting for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<JobPosting> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active JobPosting for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public JobPosting getById(UUID id, UUID organizationId) {
        log.debug("Fetching JobPosting with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting not found with id: " + id));
    }

    public JobPosting create(JobPosting entity, UUID organizationId) {
        log.debug("Creating new JobPosting for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public JobPosting update(UUID id, JobPosting entity, UUID organizationId) {
        log.debug("Updating JobPosting with id: {} for organization: {}", id, organizationId);
        JobPosting existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting JobPosting with id: {} for organization: {}", id, organizationId);
        JobPosting entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting JobPosting with id: {} for organization: {}", id, organizationId);
        JobPosting entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
