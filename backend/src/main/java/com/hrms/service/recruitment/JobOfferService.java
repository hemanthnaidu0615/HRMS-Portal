package com.hrms.service.recruitment;

import com.hrms.entity.recruitment.JobOffer;
import com.hrms.repository.recruitment.JobOfferRepository;
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
public class JobOfferService {

    private final JobOfferRepository repository;

    public List<JobOffer> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all JobOffer for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<JobOffer> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active JobOffer for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public JobOffer getById(UUID id, UUID organizationId) {
        log.debug("Fetching JobOffer with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("JobOffer not found with id: " + id));
    }

    public JobOffer create(JobOffer entity, UUID organizationId) {
        log.debug("Creating new JobOffer for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public JobOffer update(UUID id, JobOffer entity, UUID organizationId) {
        log.debug("Updating JobOffer with id: {} for organization: {}", id, organizationId);
        JobOffer existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting JobOffer with id: {} for organization: {}", id, organizationId);
        JobOffer entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting JobOffer with id: {} for organization: {}", id, organizationId);
        JobOffer entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
