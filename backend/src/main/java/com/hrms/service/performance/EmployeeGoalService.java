package com.hrms.service.performance;

import com.hrms.entity.performance.EmployeeGoal;
import com.hrms.repository.performance.EmployeeGoalRepository;
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
public class EmployeeGoalService {

    private final EmployeeGoalRepository repository;

    public List<EmployeeGoal> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all EmployeeGoal for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<EmployeeGoal> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active EmployeeGoal for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public EmployeeGoal getById(UUID id, UUID organizationId) {
        log.debug("Fetching EmployeeGoal with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeGoal not found with id: " + id));
    }

    public EmployeeGoal create(EmployeeGoal entity, UUID organizationId) {
        log.debug("Creating new EmployeeGoal for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public EmployeeGoal update(UUID id, EmployeeGoal entity, UUID organizationId) {
        log.debug("Updating EmployeeGoal with id: {} for organization: {}", id, organizationId);
        EmployeeGoal existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting EmployeeGoal with id: {} for organization: {}", id, organizationId);
        EmployeeGoal entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting EmployeeGoal with id: {} for organization: {}", id, organizationId);
        EmployeeGoal entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
