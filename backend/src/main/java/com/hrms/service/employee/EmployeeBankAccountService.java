package com.hrms.service.employee;

import com.hrms.dto.employee.request.BankAccountRequest;
import com.hrms.dto.employee.response.BankAccountResponse;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.entity.employee.EmployeeBankAccount;
import com.hrms.exception.BusinessException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.employee.EmployeeBankAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmployeeBankAccountService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeBankAccountService.class);

    private final EmployeeBankAccountRepository bankAccountRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeBankAccountService(
            EmployeeBankAccountRepository bankAccountRepository,
            EmployeeRepository employeeRepository
    ) {
        this.bankAccountRepository = bankAccountRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Get all active bank accounts for an employee
     */
    public List<BankAccountResponse> getAccountsByEmployeeId(UUID employeeId) {
        return bankAccountRepository.findByEmployeeIdAndIsActiveTrueOrderByPriorityAsc(employeeId)
                .stream()
                .map(BankAccountResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific bank account by ID
     */
    public BankAccountResponse getAccountById(UUID accountId) {
        EmployeeBankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> ResourceNotFoundException.bankAccount(accountId));
        return BankAccountResponse.fromEntity(account);
    }

    /**
     * Add a new bank account
     */
    @Transactional
    public BankAccountResponse addAccount(UUID employeeId, BankAccountRequest request, User currentUser) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.employee(employeeId));

        // Validate country-specific routing code
        if (!request.hasRequiredRoutingCode()) {
            throw BusinessException.invalidBankRoutingCode(request.getBankCountryCode());
        }

        // Check for duplicate account number
        if (bankAccountRepository.existsByEmployeeAndAccountNumberAndIsActiveTrue(employee, request.getAccountNumber())) {
            throw BusinessException.duplicateBankAccount();
        }

        // Determine priority
        int maxPriority = bankAccountRepository.findMaxPriorityByEmployeeId(employeeId);
        int newPriority = maxPriority + 1;

        boolean isPrimary = Boolean.TRUE.equals(request.getIsPrimary()) || maxPriority == 0;

        EmployeeBankAccount account = EmployeeBankAccount.builder()
                .employee(employee)
                .organization(employee.getOrganization())
                .accountPurpose(EmployeeBankAccount.AccountPurpose.valueOf(request.getAccountPurpose()))
                .isPrimary(isPrimary)
                .priority(newPriority)
                .bankName(request.getBankName())
                .bankBranch(request.getBankBranch())
                .bankAddress(request.getBankAddress())
                .accountHolderName(request.getAccountHolderName())
                .accountNumber(request.getAccountNumber())
                .accountType(EmployeeBankAccount.AccountType.valueOf(request.getAccountType()))
                // International
                .swiftCode(request.getSwiftCode())
                .iban(request.getIban())
                // USA
                .routingNumber(request.getRoutingNumber())
                // India
                .ifscCode(request.getIfscCode())
                // UK
                .sortCode(request.getSortCode())
                // Australia
                .bsbCode(request.getBsbCode())
                // Canada
                .transitNumber(request.getTransitNumber())
                .institutionNumber(request.getInstitutionNumber())
                // Mexico
                .clabe(request.getClabe())
                // Country & Currency
                .bankCountry(request.getBankCountry())
                .bankCountryCode(request.getBankCountryCode())
                .currency(request.getCurrency())
                // Salary Split
                .splitType(request.getSplitType() != null ? EmployeeBankAccount.SplitType.valueOf(request.getSplitType()) : null)
                .splitValue(request.getSplitValue())
                // Status
                .verificationStatus(EmployeeBankAccount.VerificationStatus.PENDING)
                .isActive(true)
                .createdBy(currentUser)
                .build();

        // If this is primary, unset other primary accounts
        if (isPrimary) {
            unsetPrimaryAccounts(employeeId);
        }

        EmployeeBankAccount saved = bankAccountRepository.save(account);
        logger.info("Added bank account {} for employee {}", saved.getId(), employeeId);

        return BankAccountResponse.fromEntity(saved);
    }

    /**
     * Update a bank account
     */
    @Transactional
    public BankAccountResponse updateAccount(UUID accountId, BankAccountRequest request, User currentUser) {
        EmployeeBankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> ResourceNotFoundException.bankAccount(accountId));

        // If changing account number, reset verification
        if (request.getAccountNumber() != null && !request.getAccountNumber().equals(account.getAccountNumber())) {
            account.setAccountNumber(request.getAccountNumber());
            account.setVerificationStatus(EmployeeBankAccount.VerificationStatus.PENDING);
            account.setVerifiedAt(null);
            account.setVerifiedBy(null);
        }

        // Update fields
        if (request.getAccountPurpose() != null) {
            account.setAccountPurpose(EmployeeBankAccount.AccountPurpose.valueOf(request.getAccountPurpose()));
        }
        if (request.getBankName() != null) {
            account.setBankName(request.getBankName());
        }
        if (request.getBankBranch() != null) {
            account.setBankBranch(request.getBankBranch());
        }
        if (request.getAccountHolderName() != null) {
            account.setAccountHolderName(request.getAccountHolderName());
        }
        if (request.getAccountType() != null) {
            account.setAccountType(EmployeeBankAccount.AccountType.valueOf(request.getAccountType()));
        }

        // Update routing codes
        if (request.getSwiftCode() != null) account.setSwiftCode(request.getSwiftCode());
        if (request.getIban() != null) account.setIban(request.getIban());
        if (request.getRoutingNumber() != null) account.setRoutingNumber(request.getRoutingNumber());
        if (request.getIfscCode() != null) account.setIfscCode(request.getIfscCode());
        if (request.getSortCode() != null) account.setSortCode(request.getSortCode());
        if (request.getBsbCode() != null) account.setBsbCode(request.getBsbCode());
        if (request.getTransitNumber() != null) account.setTransitNumber(request.getTransitNumber());
        if (request.getInstitutionNumber() != null) account.setInstitutionNumber(request.getInstitutionNumber());
        if (request.getClabe() != null) account.setClabe(request.getClabe());

        // Update country/currency
        if (request.getBankCountry() != null) account.setBankCountry(request.getBankCountry());
        if (request.getBankCountryCode() != null) account.setBankCountryCode(request.getBankCountryCode());
        if (request.getCurrency() != null) account.setCurrency(request.getCurrency());

        // Update salary split
        if (request.getSplitType() != null) {
            account.setSplitType(EmployeeBankAccount.SplitType.valueOf(request.getSplitType()));
        }
        if (request.getSplitValue() != null) {
            account.setSplitValue(request.getSplitValue());
        }

        // Handle primary flag
        if (Boolean.TRUE.equals(request.getIsPrimary()) && !Boolean.TRUE.equals(account.getIsPrimary())) {
            unsetPrimaryAccounts(account.getEmployee().getId());
            account.setIsPrimary(true);
        }

        account.setUpdatedBy(currentUser);
        EmployeeBankAccount saved = bankAccountRepository.save(account);
        logger.info("Updated bank account {} for employee {}", accountId, account.getEmployee().getId());

        return BankAccountResponse.fromEntity(saved);
    }

    /**
     * Verify a bank account
     */
    @Transactional
    public BankAccountResponse verifyAccount(UUID accountId, boolean approved, String method, String notes, User verifier) {
        EmployeeBankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> ResourceNotFoundException.bankAccount(accountId));

        if (approved) {
            account.setVerificationStatus(EmployeeBankAccount.VerificationStatus.VERIFIED);
        } else {
            account.setVerificationStatus(EmployeeBankAccount.VerificationStatus.FAILED);
        }

        account.setVerifiedAt(LocalDateTime.now());
        account.setVerifiedBy(verifier);
        account.setVerificationMethod(method);
        account.setVerificationNotes(notes);
        account.setUpdatedBy(verifier);

        EmployeeBankAccount saved = bankAccountRepository.save(account);
        logger.info("Bank account {} verification: {} by user {}",
                accountId, approved ? "APPROVED" : "REJECTED", verifier.getId());

        return BankAccountResponse.fromEntity(saved);
    }

    /**
     * Soft delete a bank account
     */
    @Transactional
    public void deleteAccount(UUID accountId, String reason, User currentUser) {
        EmployeeBankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> ResourceNotFoundException.bankAccount(accountId));

        // Must have at least one active bank account for payroll
        long count = bankAccountRepository.countByEmployeeAndIsActiveTrue(account.getEmployee());
        if (count <= 1) {
            throw BusinessException.minimumBankAccount();
        }

        account.setIsActive(false);
        account.setDeactivatedAt(LocalDateTime.now());
        account.setDeactivationReason(reason);
        account.setUpdatedBy(currentUser);
        bankAccountRepository.save(account);

        // If this was primary, make next one primary
        if (Boolean.TRUE.equals(account.getIsPrimary())) {
            bankAccountRepository.findByEmployeeIdAndIsActiveTrueOrderByPriorityAsc(account.getEmployee().getId())
                    .stream()
                    .findFirst()
                    .ifPresent(nextAccount -> {
                        nextAccount.setIsPrimary(true);
                        bankAccountRepository.save(nextAccount);
                    });
        }

        logger.info("Deleted bank account {} for employee {}", accountId, account.getEmployee().getId());
    }

    /**
     * Set a bank account as primary
     */
    @Transactional
    public BankAccountResponse setPrimaryAccount(UUID accountId, User currentUser) {
        EmployeeBankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> ResourceNotFoundException.bankAccount(accountId));

        unsetPrimaryAccounts(account.getEmployee().getId());
        account.setIsPrimary(true);
        account.setUpdatedBy(currentUser);

        EmployeeBankAccount saved = bankAccountRepository.save(account);
        logger.info("Set bank account {} as primary for employee {}", accountId, account.getEmployee().getId());

        return BankAccountResponse.fromEntity(saved);
    }

    private void unsetPrimaryAccounts(UUID employeeId) {
        List<EmployeeBankAccount> accounts = bankAccountRepository.findByEmployeeIdAndIsActiveTrueOrderByPriorityAsc(employeeId);
        for (EmployeeBankAccount acc : accounts) {
            if (Boolean.TRUE.equals(acc.getIsPrimary())) {
                acc.setIsPrimary(false);
                bankAccountRepository.save(acc);
            }
        }
    }

    /**
     * Check if employee has at least one verified bank account
     */
    public boolean hasBankAccount(UUID employeeId) {
        return bankAccountRepository.findPrimaryAccountByEmployeeId(employeeId).isPresent();
    }
}
