package com.hrms.service.leave;

import com.hrms.entity.leave.LeaveBalance;
import com.hrms.repository.leave.LeaveBalanceRepository;
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
public class LeaveBalanceService {

    private final LeaveBalanceRepository repository;

    public List<LeaveBalance> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all LeaveBalance for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<LeaveBalance> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active LeaveBalance for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public LeaveBalance getById(UUID id, UUID organizationId) {
        log.debug("Fetching LeaveBalance with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveBalance not found with id: " + id));
    }

    public LeaveBalance create(LeaveBalance entity, UUID organizationId) {
        log.debug("Creating new LeaveBalance for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public LeaveBalance update(UUID id, LeaveBalance entity, UUID organizationId) {
        log.debug("Updating LeaveBalance with id: {} for organization: {}", id, organizationId);
        LeaveBalance existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting LeaveBalance with id: {} for organization: {}", id, organizationId);
        LeaveBalance entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting LeaveBalance with id: {} for organization: {}", id, organizationId);
        LeaveBalance entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
