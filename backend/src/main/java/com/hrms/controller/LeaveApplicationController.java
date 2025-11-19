package com.hrms.controller;

import com.hrms.entity.LeaveApplication;
import com.hrms.service.LeaveApplicationService;
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
 * LeaveApplication REST Controller
 * Module: LEAVE
 */
@RestController
@RequestMapping("/api/leave/leave-application")
@PreAuthorize("hasRole('ORGADMIN')")
public class LeaveApplicationController {

    @Autowired
    private LeaveApplicationService service;

    /**
     * Get all records by organization with pagination
     */
    @GetMapping
    public ResponseEntity<Page<LeaveApplication>> getAll(
            @RequestParam UUID organizationId,
            Pageable pageable) {
        try {
            Page<LeaveApplication> records = service.getByOrganization(organizationId, pageable);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all records by organization without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<LeaveApplication>> getAllNoPagination(@RequestParam UUID organizationId) {
        try {
            List<LeaveApplication> records = service.getAllByOrganization(organizationId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<LeaveApplication> getById(@PathVariable UUID id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new record
     */
    @PostMapping
    public ResponseEntity<LeaveApplication> create(@RequestBody LeaveApplication entity) {
        try {
            LeaveApplication created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update existing record
     */
    @PutMapping("/{id}")
    public ResponseEntity<LeaveApplication> update(
            @PathVariable UUID id,
            @RequestBody LeaveApplication entity) {
        try {
            LeaveApplication updated = service.update(id, entity);
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
     * Approve leave application
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<LeaveApplication> approve(
            @PathVariable UUID id,
            @RequestParam UUID approverId) {
        try {
            LeaveApplication application = service.getById(id)
                .orElseThrow(() -> new RuntimeException("Leave application not found"));

            application.setStatus("APPROVED");
            application.setApprovedBy(approverId);
            application.setApprovedAt(java.time.LocalDateTime.now());

            LeaveApplication updated = service.update(id, application);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Reject leave application
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<LeaveApplication> reject(
            @PathVariable UUID id,
            @RequestParam UUID approverId,
            @RequestParam(required = false) String reason) {
        try {
            LeaveApplication application = service.getById(id)
                .orElseThrow(() -> new RuntimeException("Leave application not found"));

            application.setStatus("REJECTED");
            application.setApprovedBy(approverId);
            application.setApprovedAt(java.time.LocalDateTime.now());
            if (reason != null) {
                application.setRejectionReason(reason);
            }

            LeaveApplication updated = service.update(id, application);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
