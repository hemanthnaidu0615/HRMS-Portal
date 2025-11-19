package com.hrms.controller;

import com.hrms.entity.EmployeeGoal;
import com.hrms.service.EmployeeGoalService;
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
 * EmployeeGoal REST Controller
 * Module: PERFORMANCE
 */
@RestController
@RequestMapping("/api/performance/employee-goal")
@PreAuthorize("hasRole('ORGADMIN')")
public class EmployeeGoalController {

    @Autowired
    private EmployeeGoalService service;

    /**
     * Get all records by organization with pagination
     */
    @GetMapping
    public ResponseEntity<Page<EmployeeGoal>> getAll(
            @RequestParam UUID organizationId,
            Pageable pageable) {
        try {
            Page<EmployeeGoal> records = service.getByOrganization(organizationId, pageable);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all records by organization without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<EmployeeGoal>> getAllNoPagination(@RequestParam UUID organizationId) {
        try {
            List<EmployeeGoal> records = service.getAllByOrganization(organizationId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeGoal> getById(@PathVariable UUID id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new record
     */
    @PostMapping
    public ResponseEntity<EmployeeGoal> create(@RequestBody EmployeeGoal entity) {
        try {
            EmployeeGoal created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update existing record
     */
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeGoal> update(
            @PathVariable UUID id,
            @RequestBody EmployeeGoal entity) {
        try {
            EmployeeGoal updated = service.update(id, entity);
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
