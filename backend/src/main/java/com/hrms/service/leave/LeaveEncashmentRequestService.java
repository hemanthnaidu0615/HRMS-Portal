package com.hrms.service.leave;

import com.hrms.entity.leave.LeaveEncashmentRequest;
import com.hrms.repository.leave.LeaveEncashmentRequestRepository;
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
public class LeaveEncashmentRequestService {

    private final LeaveEncashmentRequestRepository repository;

    public List<LeaveEncashmentRequest> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all LeaveEncashmentRequest for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<LeaveEncashmentRequest> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active LeaveEncashmentRequest for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public LeaveEncashmentRequest getById(UUID id, UUID organizationId) {
        log.debug("Fetching LeaveEncashmentRequest with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveEncashmentRequest not found with id: " + id));
    }

    public LeaveEncashmentRequest create(LeaveEncashmentRequest entity, UUID organizationId) {
        log.debug("Creating new LeaveEncashmentRequest for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public LeaveEncashmentRequest update(UUID id, LeaveEncashmentRequest entity, UUID organizationId) {
        log.debug("Updating LeaveEncashmentRequest with id: {} for organization: {}", id, organizationId);
        LeaveEncashmentRequest existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting LeaveEncashmentRequest with id: {} for organization: {}", id, organizationId);
        LeaveEncashmentRequest entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting LeaveEncashmentRequest with id: {} for organization: {}", id, organizationId);
        LeaveEncashmentRequest entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
