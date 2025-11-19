package com.hrms.service.recruitment;

import com.hrms.entity.recruitment.JobApplication;
import com.hrms.repository.recruitment.JobApplicationRepository;
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
public class JobApplicationService {

    private final JobApplicationRepository repository;

    public List<JobApplication> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all JobApplication for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<JobApplication> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active JobApplication for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public JobApplication getById(UUID id, UUID organizationId) {
        log.debug("Fetching JobApplication with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication not found with id: " + id));
    }

    public JobApplication create(JobApplication entity, UUID organizationId) {
        log.debug("Creating new JobApplication for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public JobApplication update(UUID id, JobApplication entity, UUID organizationId) {
        log.debug("Updating JobApplication with id: {} for organization: {}", id, organizationId);
        JobApplication existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting JobApplication with id: {} for organization: {}", id, organizationId);
        JobApplication entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting JobApplication with id: {} for organization: {}", id, organizationId);
        JobApplication entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
