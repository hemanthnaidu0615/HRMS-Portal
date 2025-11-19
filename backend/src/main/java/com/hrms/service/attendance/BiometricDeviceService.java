package com.hrms.service.attendance;

import com.hrms.entity.attendance.BiometricDevice;
import com.hrms.repository.attendance.BiometricDeviceRepository;
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
public class BiometricDeviceService {

    private final BiometricDeviceRepository repository;

    public List<BiometricDevice> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all BiometricDevice for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<BiometricDevice> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active BiometricDevice for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public BiometricDevice getById(UUID id, UUID organizationId) {
        log.debug("Fetching BiometricDevice with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("BiometricDevice not found with id: " + id));
    }

    public BiometricDevice create(BiometricDevice entity, UUID organizationId) {
        log.debug("Creating new BiometricDevice for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public BiometricDevice update(UUID id, BiometricDevice entity, UUID organizationId) {
        log.debug("Updating BiometricDevice with id: {} for organization: {}", id, organizationId);
        BiometricDevice existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting BiometricDevice with id: {} for organization: {}", id, organizationId);
        BiometricDevice entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting BiometricDevice with id: {} for organization: {}", id, organizationId);
        BiometricDevice entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
