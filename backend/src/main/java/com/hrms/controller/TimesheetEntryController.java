package com.hrms.controller;

import com.hrms.entity.TimesheetEntry;
import com.hrms.service.TimesheetEntryService;
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
 * TimesheetEntry REST Controller
 * Module: TIMESHEET
 */
@RestController
@RequestMapping("/api/timesheet/timesheet-entry")
@PreAuthorize("hasRole('ORGADMIN')")
public class TimesheetEntryController {

    @Autowired
    private TimesheetEntryService service;

    /**
     * Get all records by organization with pagination
     */
    @GetMapping
    public ResponseEntity<Page<TimesheetEntry>> getAll(
            @RequestParam UUID organizationId,
            Pageable pageable) {
        try {
            Page<TimesheetEntry> records = service.getByOrganization(organizationId, pageable);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all records by organization without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<TimesheetEntry>> getAllNoPagination(@RequestParam UUID organizationId) {
        try {
            List<TimesheetEntry> records = service.getAllByOrganization(organizationId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TimesheetEntry> getById(@PathVariable UUID id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new record
     */
    @PostMapping
    public ResponseEntity<TimesheetEntry> create(@RequestBody TimesheetEntry entity) {
        try {
            TimesheetEntry created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update existing record
     */
    @PutMapping("/{id}")
    public ResponseEntity<TimesheetEntry> update(
            @PathVariable UUID id,
            @RequestBody TimesheetEntry entity) {
        try {
            TimesheetEntry updated = service.update(id, entity);
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
     * Approve timesheet entry
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<TimesheetEntry> approve(
            @PathVariable UUID id,
            @RequestParam UUID approverId) {
        try {
            TimesheetEntry entry = service.getById(id)
                .orElseThrow(() -> new RuntimeException("Timesheet entry not found"));

            entry.setStatus("APPROVED");
            entry.setApprovedBy(approverId);
            entry.setApprovedAt(java.time.LocalDateTime.now());

            TimesheetEntry updated = service.update(id, entry);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Reject timesheet entry
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<TimesheetEntry> reject(
            @PathVariable UUID id,
            @RequestParam UUID approverId) {
        try {
            TimesheetEntry entry = service.getById(id)
                .orElseThrow(() -> new RuntimeException("Timesheet entry not found"));

            entry.setStatus("REJECTED");
            entry.setApprovedBy(approverId);
            entry.setApprovedAt(java.time.LocalDateTime.now());

            TimesheetEntry updated = service.update(id, entry);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
