package com.hrms.service;

import com.hrms.entity.ProjectTask;
import com.hrms.repository.ProjectTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * ProjectTask Service
 * Module: PROJECTS
 */
@Service
@Transactional
public class ProjectTaskService {

    @Autowired
    private ProjectTaskRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<ProjectTask> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<ProjectTask> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get tasks by project
     */
    public List<ProjectTask> getByProject(UUID projectId) {
        return repository.findByProjectId(projectId);
    }

    /**
     * Get tasks by assignee
     */
    public List<ProjectTask> getByAssignee(UUID assignedTo) {
        return repository.findByAssignedTo(assignedTo);
    }

    /**
     * Get record by ID
     */
    public Optional<ProjectTask> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public ProjectTask create(ProjectTask entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public ProjectTask update(UUID id, ProjectTask updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("ProjectTask not found with id: " + id));
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
