package com.hrms.service.timesheet;

import com.hrms.entity.timesheet.ProjectTask;
import com.hrms.repository.timesheet.ProjectTaskRepository;
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
public class ProjectTaskService {

    private final ProjectTaskRepository repository;

    public List<ProjectTask> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all ProjectTask for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<ProjectTask> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active ProjectTask for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public ProjectTask getById(UUID id, UUID organizationId) {
        log.debug("Fetching ProjectTask with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectTask not found with id: " + id));
    }

    public ProjectTask create(ProjectTask entity, UUID organizationId) {
        log.debug("Creating new ProjectTask for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public ProjectTask update(UUID id, ProjectTask entity, UUID organizationId) {
        log.debug("Updating ProjectTask with id: {} for organization: {}", id, organizationId);
        ProjectTask existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting ProjectTask with id: {} for organization: {}", id, organizationId);
        ProjectTask entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting ProjectTask with id: {} for organization: {}", id, organizationId);
        ProjectTask entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
