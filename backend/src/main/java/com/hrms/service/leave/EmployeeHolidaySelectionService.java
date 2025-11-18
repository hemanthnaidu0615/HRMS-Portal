package com.hrms.service.leave;

import com.hrms.entity.leave.EmployeeHolidaySelection;
import com.hrms.repository.leave.EmployeeHolidaySelectionRepository;
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
public class EmployeeHolidaySelectionService {

    private final EmployeeHolidaySelectionRepository repository;

    public List<EmployeeHolidaySelection> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all EmployeeHolidaySelection for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<EmployeeHolidaySelection> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active EmployeeHolidaySelection for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public EmployeeHolidaySelection getById(UUID id, UUID organizationId) {
        log.debug("Fetching EmployeeHolidaySelection with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeHolidaySelection not found with id: " + id));
    }

    public EmployeeHolidaySelection create(EmployeeHolidaySelection entity, UUID organizationId) {
        log.debug("Creating new EmployeeHolidaySelection for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public EmployeeHolidaySelection update(UUID id, EmployeeHolidaySelection entity, UUID organizationId) {
        log.debug("Updating EmployeeHolidaySelection with id: {} for organization: {}", id, organizationId);
        EmployeeHolidaySelection existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting EmployeeHolidaySelection with id: {} for organization: {}", id, organizationId);
        EmployeeHolidaySelection entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting EmployeeHolidaySelection with id: {} for organization: {}", id, organizationId);
        EmployeeHolidaySelection entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
