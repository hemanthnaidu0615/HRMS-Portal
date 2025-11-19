package com.hrms.controller;

import com.hrms.entity.ExpenseClaim;
import com.hrms.service.ExpenseClaimService;
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
 * ExpenseClaim REST Controller
 * Module: EXPENSES
 */
@RestController
@RequestMapping("/api/expenses/expense-claim")
@PreAuthorize("hasRole('ORGADMIN')")
public class ExpenseClaimController {

    @Autowired
    private ExpenseClaimService service;

    /**
     * Get all records by organization with pagination
     */
    @GetMapping
    public ResponseEntity<Page<ExpenseClaim>> getAll(
            @RequestParam UUID organizationId,
            Pageable pageable) {
        try {
            Page<ExpenseClaim> records = service.getByOrganization(organizationId, pageable);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all records by organization without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<ExpenseClaim>> getAllNoPagination(@RequestParam UUID organizationId) {
        try {
            List<ExpenseClaim> records = service.getAllByOrganization(organizationId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseClaim> getById(@PathVariable UUID id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new record
     */
    @PostMapping
    public ResponseEntity<ExpenseClaim> create(@RequestBody ExpenseClaim entity) {
        try {
            ExpenseClaim created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update existing record
     */
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseClaim> update(
            @PathVariable UUID id,
            @RequestBody ExpenseClaim entity) {
        try {
            ExpenseClaim updated = service.update(id, entity);
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
     * Approve expense claim
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ExpenseClaim> approve(
            @PathVariable UUID id,
            @RequestParam UUID approverId) {
        try {
            ExpenseClaim claim = service.getById(id)
                .orElseThrow(() -> new RuntimeException("Expense claim not found"));

            claim.setStatus("APPROVED");
            claim.setApprovedBy(approverId);
            claim.setApprovedAt(java.time.LocalDateTime.now());

            ExpenseClaim updated = service.update(id, claim);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Reject expense claim
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<ExpenseClaim> reject(
            @PathVariable UUID id,
            @RequestParam UUID approverId,
            @RequestParam(required = false) String reason) {
        try {
            ExpenseClaim claim = service.getById(id)
                .orElseThrow(() -> new RuntimeException("Expense claim not found"));

            claim.setStatus("REJECTED");
            claim.setApprovedBy(approverId);
            claim.setApprovedAt(java.time.LocalDateTime.now());
            if (reason != null) {
                claim.setRejectionReason(reason);
            }

            ExpenseClaim updated = service.update(id, claim);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
