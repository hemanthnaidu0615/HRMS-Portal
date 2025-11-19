package com.hrms.service.leave;

import com.hrms.entity.leave.LeaveType;
import com.hrms.repository.leave.LeaveTypeRepository;
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
public class LeaveTypeService {

    private final LeaveTypeRepository repository;

    public List<LeaveType> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all LeaveType for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<LeaveType> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active LeaveType for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public LeaveType getById(UUID id, UUID organizationId) {
        log.debug("Fetching LeaveType with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType not found with id: " + id));
    }

    public LeaveType create(LeaveType entity, UUID organizationId) {
        log.debug("Creating new LeaveType for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public LeaveType update(UUID id, LeaveType entity, UUID organizationId) {
        log.debug("Updating LeaveType with id: {} for organization: {}", id, organizationId);
        LeaveType existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting LeaveType with id: {} for organization: {}", id, organizationId);
        LeaveType entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting LeaveType with id: {} for organization: {}", id, organizationId);
        LeaveType entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
