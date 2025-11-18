package com.hrms.service.expense;

import com.hrms.entity.expense.ExpenseClaimItem;
import com.hrms.repository.expense.ExpenseClaimItemRepository;
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
public class ExpenseClaimItemService {

    private final ExpenseClaimItemRepository repository;

    public List<ExpenseClaimItem> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all ExpenseClaimItem for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<ExpenseClaimItem> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active ExpenseClaimItem for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public ExpenseClaimItem getById(UUID id, UUID organizationId) {
        log.debug("Fetching ExpenseClaimItem with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("ExpenseClaimItem not found with id: " + id));
    }

    public ExpenseClaimItem create(ExpenseClaimItem entity, UUID organizationId) {
        log.debug("Creating new ExpenseClaimItem for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public ExpenseClaimItem update(UUID id, ExpenseClaimItem entity, UUID organizationId) {
        log.debug("Updating ExpenseClaimItem with id: {} for organization: {}", id, organizationId);
        ExpenseClaimItem existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting ExpenseClaimItem with id: {} for organization: {}", id, organizationId);
        ExpenseClaimItem entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting ExpenseClaimItem with id: {} for organization: {}", id, organizationId);
        ExpenseClaimItem entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
