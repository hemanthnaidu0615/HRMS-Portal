package com.hrms.controller.employee;

import com.hrms.dto.employee.request.BankAccountRequest;
import com.hrms.dto.employee.response.BankAccountResponse;
import com.hrms.entity.User;
import com.hrms.service.employee.EmployeeBankAccountService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Employee Bank Accounts
 */
@RestController
@RequestMapping("/api/employees/{employeeId}/bank-accounts")
public class EmployeeBankAccountController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeBankAccountController.class);

    private final EmployeeBankAccountService bankAccountService;

    public EmployeeBankAccountController(EmployeeBankAccountService bankAccountService) {
        this.bankAccountService = bankAccountService;
    }

    /**
     * Get all bank accounts for an employee (ordered by priority)
     */
    @GetMapping
    public ResponseEntity<List<BankAccountResponse>> getAccounts(
            @PathVariable UUID employeeId
    ) {
        List<BankAccountResponse> accounts = bankAccountService.getAccountsByEmployeeId(employeeId);
        return ResponseEntity.ok(accounts);
    }

    /**
     * Get a specific bank account
     */
    @GetMapping("/{accountId}")
    public ResponseEntity<BankAccountResponse> getAccount(
            @PathVariable UUID employeeId,
            @PathVariable UUID accountId
    ) {
        BankAccountResponse account = bankAccountService.getAccountById(accountId);
        return ResponseEntity.ok(account);
    }

    /**
     * Add a new bank account
     */
    @PostMapping
    public ResponseEntity<BankAccountResponse> addAccount(
            @PathVariable UUID employeeId,
            @Valid @RequestBody BankAccountRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Adding bank account for employee: {}", employeeId);
        BankAccountResponse account = bankAccountService.addAccount(employeeId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    /**
     * Update a bank account
     */
    @PutMapping("/{accountId}")
    public ResponseEntity<BankAccountResponse> updateAccount(
            @PathVariable UUID employeeId,
            @PathVariable UUID accountId,
            @Valid @RequestBody BankAccountRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Updating bank account {} for employee: {}", accountId, employeeId);
        BankAccountResponse account = bankAccountService.updateAccount(accountId, request, currentUser);
        return ResponseEntity.ok(account);
    }

    /**
     * Delete a bank account
     */
    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable UUID employeeId,
            @PathVariable UUID accountId,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Deleting bank account {} for employee: {}", accountId, employeeId);
        bankAccountService.deleteAccount(accountId, reason, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * Set a bank account as primary
     */
    @PostMapping("/{accountId}/set-primary")
    public ResponseEntity<BankAccountResponse> setPrimary(
            @PathVariable UUID employeeId,
            @PathVariable UUID accountId,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Setting bank account {} as primary for employee: {}", accountId, employeeId);
        BankAccountResponse account = bankAccountService.setPrimaryAccount(accountId, currentUser);
        return ResponseEntity.ok(account);
    }

    /**
     * Verify a bank account (Admin only)
     */
    @PostMapping("/{accountId}/verify")
    public ResponseEntity<BankAccountResponse> verifyAccount(
            @PathVariable UUID employeeId,
            @PathVariable UUID accountId,
            @RequestParam boolean approved,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal User currentUser
    ) {
        logger.info("Verifying bank account {} for employee: {} - approved: {}",
                accountId, employeeId, approved);
        BankAccountResponse account = bankAccountService.verifyAccount(accountId, approved, method, notes, currentUser);
        return ResponseEntity.ok(account);
    }
}
