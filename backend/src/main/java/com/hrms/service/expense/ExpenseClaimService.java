package com.hrms.service.expense;

import com.hrms.entity.expense.ExpenseClaim;
import com.hrms.repository.expense.ExpenseClaimRepository;
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
public class ExpenseClaimService {

    private final ExpenseClaimRepository repository;

    public List<ExpenseClaim> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all ExpenseClaim for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<ExpenseClaim> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active ExpenseClaim for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public ExpenseClaim getById(UUID id, UUID organizationId) {
        log.debug("Fetching ExpenseClaim with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("ExpenseClaim not found with id: " + id));
    }

    public ExpenseClaim create(ExpenseClaim entity, UUID organizationId) {
        log.debug("Creating new ExpenseClaim for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public ExpenseClaim update(UUID id, ExpenseClaim entity, UUID organizationId) {
        log.debug("Updating ExpenseClaim with id: {} for organization: {}", id, organizationId);
        ExpenseClaim existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting ExpenseClaim with id: {} for organization: {}", id, organizationId);
        ExpenseClaim entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting ExpenseClaim with id: {} for organization: {}", id, organizationId);
        ExpenseClaim entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
