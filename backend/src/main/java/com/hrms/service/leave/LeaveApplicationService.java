package com.hrms.service.leave;

import com.hrms.entity.leave.LeaveApplication;
import com.hrms.repository.leave.LeaveApplicationRepository;
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
public class LeaveApplicationService {

    private final LeaveApplicationRepository repository;

    public List<LeaveApplication> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all LeaveApplication for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<LeaveApplication> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active LeaveApplication for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public LeaveApplication getById(UUID id, UUID organizationId) {
        log.debug("Fetching LeaveApplication with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveApplication not found with id: " + id));
    }

    public LeaveApplication create(LeaveApplication entity, UUID organizationId) {
        log.debug("Creating new LeaveApplication for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public LeaveApplication update(UUID id, LeaveApplication entity, UUID organizationId) {
        log.debug("Updating LeaveApplication with id: {} for organization: {}", id, organizationId);
        LeaveApplication existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting LeaveApplication with id: {} for organization: {}", id, organizationId);
        LeaveApplication entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting LeaveApplication with id: {} for organization: {}", id, organizationId);
        LeaveApplication entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
