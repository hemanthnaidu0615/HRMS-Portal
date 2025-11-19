package com.hrms.controller;

import com.hrms.entity.ProjectTask;
import com.hrms.service.ProjectTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * ProjectTask REST Controller
 * Module: PROJECTS
 */
@RestController
@RequestMapping("/api/projects/tasks")
@PreAuthorize("hasRole('ORGADMIN')")
public class ProjectTaskController {

    @Autowired
    private ProjectTaskService service;

    /**
     * Get all records by organization with pagination
     */
    @GetMapping
    public ResponseEntity<Page<ProjectTask>> getAll(
            @RequestParam UUID organizationId,
            Pageable pageable) {
        try {
            Page<ProjectTask> records = service.getByOrganization(organizationId, pageable);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all records by organization without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<ProjectTask>> getAllNoPagination(@RequestParam UUID organizationId) {
        try {
            List<ProjectTask> records = service.getAllByOrganization(organizationId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tasks by project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectTask>> getByProject(@PathVariable UUID projectId) {
        try {
            List<ProjectTask> tasks = service.getByProject(projectId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tasks by assignee
     */
    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<ProjectTask>> getByAssignee(@PathVariable UUID assigneeId) {
        try {
            List<ProjectTask> tasks = service.getByAssignee(assigneeId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectTask> getById(@PathVariable UUID id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new record
     */
    @PostMapping
    public ResponseEntity<ProjectTask> create(@RequestBody ProjectTask entity) {
        try {
            ProjectTask created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update existing record
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectTask> update(
            @PathVariable UUID id,
            @RequestBody ProjectTask entity) {
        try {
            ProjectTask updated = service.update(id, entity);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete record
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get count by organization
     */
    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam UUID organizationId) {
        try {
            Long count = service.countByOrganization(organizationId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
