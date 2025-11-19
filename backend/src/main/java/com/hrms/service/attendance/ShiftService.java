package com.hrms.service.attendance;

import com.hrms.entity.attendance.Shift;
import com.hrms.repository.attendance.ShiftRepository;
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
public class ShiftService {

    private final ShiftRepository repository;

    public List<Shift> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all Shift for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<Shift> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active Shift for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public Shift getById(UUID id, UUID organizationId) {
        log.debug("Fetching Shift with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + id));
    }

    public Shift create(Shift entity, UUID organizationId) {
        log.debug("Creating new Shift for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public Shift update(UUID id, Shift entity, UUID organizationId) {
        log.debug("Updating Shift with id: {} for organization: {}", id, organizationId);
        Shift existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting Shift with id: {} for organization: {}", id, organizationId);
        Shift entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting Shift with id: {} for organization: {}", id, organizationId);
        Shift entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
