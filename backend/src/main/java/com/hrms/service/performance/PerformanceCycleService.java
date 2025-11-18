package com.hrms.service.performance;

import com.hrms.entity.performance.PerformanceCycle;
import com.hrms.repository.performance.PerformanceCycleRepository;
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
public class PerformanceCycleService {

    private final PerformanceCycleRepository repository;

    public List<PerformanceCycle> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all PerformanceCycle for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<PerformanceCycle> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active PerformanceCycle for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public PerformanceCycle getById(UUID id, UUID organizationId) {
        log.debug("Fetching PerformanceCycle with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceCycle not found with id: " + id));
    }

    public PerformanceCycle create(PerformanceCycle entity, UUID organizationId) {
        log.debug("Creating new PerformanceCycle for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public PerformanceCycle update(UUID id, PerformanceCycle entity, UUID organizationId) {
        log.debug("Updating PerformanceCycle with id: {} for organization: {}", id, organizationId);
        PerformanceCycle existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting PerformanceCycle with id: {} for organization: {}", id, organizationId);
        PerformanceCycle entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting PerformanceCycle with id: {} for organization: {}", id, organizationId);
        PerformanceCycle entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
