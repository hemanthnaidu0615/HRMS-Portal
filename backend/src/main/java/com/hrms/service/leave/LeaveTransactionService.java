package com.hrms.service.leave;

import com.hrms.entity.leave.LeaveTransaction;
import com.hrms.repository.leave.LeaveTransactionRepository;
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
public class LeaveTransactionService {

    private final LeaveTransactionRepository repository;

    public List<LeaveTransaction> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all LeaveTransaction for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<LeaveTransaction> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active LeaveTransaction for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public LeaveTransaction getById(UUID id, UUID organizationId) {
        log.debug("Fetching LeaveTransaction with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveTransaction not found with id: " + id));
    }

    public LeaveTransaction create(LeaveTransaction entity, UUID organizationId) {
        log.debug("Creating new LeaveTransaction for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public LeaveTransaction update(UUID id, LeaveTransaction entity, UUID organizationId) {
        log.debug("Updating LeaveTransaction with id: {} for organization: {}", id, organizationId);
        LeaveTransaction existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting LeaveTransaction with id: {} for organization: {}", id, organizationId);
        LeaveTransaction entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting LeaveTransaction with id: {} for organization: {}", id, organizationId);
        LeaveTransaction entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
