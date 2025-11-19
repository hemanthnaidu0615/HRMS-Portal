package com.hrms.controller;

import com.hrms.entity.ExpenseCategory;
import com.hrms.service.ExpenseCategoryService;
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
 * ExpenseCategory REST Controller
 * Module: EXPENSES
 */
@RestController
@RequestMapping("/api/expenses/expense-category")
@PreAuthorize("hasRole('ORGADMIN')")
public class ExpenseCategoryController {

    @Autowired
    private ExpenseCategoryService service;

    /**
     * Get all records by organization with pagination
     */
    @GetMapping
    public ResponseEntity<Page<ExpenseCategory>> getAll(
            @RequestParam UUID organizationId,
            Pageable pageable) {
        try {
            Page<ExpenseCategory> records = service.getByOrganization(organizationId, pageable);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all records by organization without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<ExpenseCategory>> getAllNoPagination(@RequestParam UUID organizationId) {
        try {
            List<ExpenseCategory> records = service.getAllByOrganization(organizationId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseCategory> getById(@PathVariable UUID id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new record
     */
    @PostMapping
    public ResponseEntity<ExpenseCategory> create(@RequestBody ExpenseCategory entity) {
        try {
            ExpenseCategory created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update existing record
     */
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseCategory> update(
            @PathVariable UUID id,
            @RequestBody ExpenseCategory entity) {
        try {
            ExpenseCategory updated = service.update(id, entity);
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
