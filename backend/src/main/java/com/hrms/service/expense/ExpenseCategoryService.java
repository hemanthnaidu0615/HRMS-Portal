package com.hrms.service.expense;

import com.hrms.entity.expense.ExpenseCategory;
import com.hrms.repository.expense.ExpenseCategoryRepository;
import com.hrms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExpenseCategoryService {

    private final ExpenseCategoryRepository repository;

    public List<ExpenseCategory> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all ExpenseCategory for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<ExpenseCategory> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active ExpenseCategory for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public ExpenseCategory getById(UUID id, UUID organizationId) {
        log.debug("Fetching ExpenseCategory with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("ExpenseCategory not found with id: " + id));
    }

    public ExpenseCategory create(ExpenseCategory entity, UUID organizationId) {
        log.debug("Creating new ExpenseCategory for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public ExpenseCategory update(UUID id, ExpenseCategory entity, UUID organizationId) {
        log.debug("Updating ExpenseCategory with id: {} for organization: {}", id, organizationId);
        ExpenseCategory existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting ExpenseCategory with id: {} for organization: {}", id, organizationId);
        ExpenseCategory entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting ExpenseCategory with id: {} for organization: {}", id, organizationId);
        ExpenseCategory entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
