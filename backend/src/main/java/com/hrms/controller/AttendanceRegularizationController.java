package com.hrms.controller;

import com.hrms.entity.AttendanceRegularization;
import com.hrms.service.AttendanceRegularizationService;
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
 * AttendanceRegularization REST Controller
 * Module: ATTENDANCE
 */
@RestController
@RequestMapping("/api/attendance/attendance-regularization")
@PreAuthorize("hasRole('ORGADMIN')")
public class AttendanceRegularizationController {

    @Autowired
    private AttendanceRegularizationService service;

    /**
     * Get all records by organization with pagination
     */
    @GetMapping
    public ResponseEntity<Page<AttendanceRegularization>> getAll(
            @RequestParam UUID organizationId,
            Pageable pageable) {
        try {
            Page<AttendanceRegularization> records = service.getByOrganization(organizationId, pageable);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all records by organization without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<AttendanceRegularization>> getAllNoPagination(@RequestParam UUID organizationId) {
        try {
            List<AttendanceRegularization> records = service.getAllByOrganization(organizationId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AttendanceRegularization> getById(@PathVariable UUID id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new record
     */
    @PostMapping
    public ResponseEntity<AttendanceRegularization> create(@RequestBody AttendanceRegularization entity) {
        try {
            AttendanceRegularization created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update existing record
     */
    @PutMapping("/{id}")
    public ResponseEntity<AttendanceRegularization> update(
            @PathVariable UUID id,
            @RequestBody AttendanceRegularization entity) {
        try {
            AttendanceRegularization updated = service.update(id, entity);
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

    /**
     * Approve regularization request
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<AttendanceRegularization> approve(
            @PathVariable UUID id,
            @RequestParam UUID approverId) {
        try {
            AttendanceRegularization request = service.getById(id)
                .orElseThrow(() -> new RuntimeException("Regularization request not found"));

            request.setStatus("APPROVED");
            request.setApprovedBy(approverId);
            request.setApprovedAt(java.time.LocalDateTime.now());

            AttendanceRegularization updated = service.update(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Reject regularization request
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<AttendanceRegularization> reject(
            @PathVariable UUID id,
            @RequestParam UUID approverId) {
        try {
            AttendanceRegularization request = service.getById(id)
                .orElseThrow(() -> new RuntimeException("Regularization request not found"));

            request.setStatus("REJECTED");
            request.setApprovedBy(approverId);
            request.setApprovedAt(java.time.LocalDateTime.now());

            AttendanceRegularization updated = service.update(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
