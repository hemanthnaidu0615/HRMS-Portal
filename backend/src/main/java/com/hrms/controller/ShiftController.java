package com.hrms.controller;

import com.hrms.entity.Shift;
import com.hrms.service.ShiftService;
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
 * Shift REST Controller
 * Module: ATTENDANCE
 */
@RestController
@RequestMapping("/api/attendance/shift")
@PreAuthorize("hasRole('ORGADMIN')")
public class ShiftController {

    @Autowired
    private ShiftService service;

    /**
     * Get all records by organization with pagination
     */
    @GetMapping
    public ResponseEntity<Page<Shift>> getAll(
            @RequestParam UUID organizationId,
            Pageable pageable) {
        try {
            Page<Shift> records = service.getByOrganization(organizationId, pageable);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all records by organization without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<Shift>> getAllNoPagination(@RequestParam UUID organizationId) {
        try {
            List<Shift> records = service.getAllByOrganization(organizationId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Shift> getById(@PathVariable UUID id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new record
     */
    @PostMapping
    public ResponseEntity<Shift> create(@RequestBody Shift entity) {
        try {
            Shift created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update existing record
     */
    @PutMapping("/{id}")
    public ResponseEntity<Shift> update(
            @PathVariable UUID id,
            @RequestBody Shift entity) {
        try {
            Shift updated = service.update(id, entity);
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
