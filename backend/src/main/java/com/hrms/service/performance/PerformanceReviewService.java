package com.hrms.service.performance;

import com.hrms.entity.performance.PerformanceReview;
import com.hrms.repository.performance.PerformanceReviewRepository;
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
public class PerformanceReviewService {

    private final PerformanceReviewRepository repository;

    public List<PerformanceReview> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all PerformanceReview for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<PerformanceReview> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active PerformanceReview for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public PerformanceReview getById(UUID id, UUID organizationId) {
        log.debug("Fetching PerformanceReview with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview not found with id: " + id));
    }

    public PerformanceReview create(PerformanceReview entity, UUID organizationId) {
        log.debug("Creating new PerformanceReview for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public PerformanceReview update(UUID id, PerformanceReview entity, UUID organizationId) {
        log.debug("Updating PerformanceReview with id: {} for organization: {}", id, organizationId);
        PerformanceReview existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting PerformanceReview with id: {} for organization: {}", id, organizationId);
        PerformanceReview entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting PerformanceReview with id: {} for organization: {}", id, organizationId);
        PerformanceReview entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
