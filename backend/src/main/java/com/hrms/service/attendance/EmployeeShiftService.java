package com.hrms.service.attendance;

import com.hrms.entity.attendance.EmployeeShift;
import com.hrms.repository.attendance.EmployeeShiftRepository;
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
public class EmployeeShiftService {

    private final EmployeeShiftRepository repository;

    public List<EmployeeShift> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all EmployeeShift for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<EmployeeShift> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active EmployeeShift for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public EmployeeShift getById(UUID id, UUID organizationId) {
        log.debug("Fetching EmployeeShift with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeShift not found with id: " + id));
    }

    public EmployeeShift create(EmployeeShift entity, UUID organizationId) {
        log.debug("Creating new EmployeeShift for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public EmployeeShift update(UUID id, EmployeeShift entity, UUID organizationId) {
        log.debug("Updating EmployeeShift with id: {} for organization: {}", id, organizationId);
        EmployeeShift existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting EmployeeShift with id: {} for organization: {}", id, organizationId);
        EmployeeShift entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting EmployeeShift with id: {} for organization: {}", id, organizationId);
        EmployeeShift entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
