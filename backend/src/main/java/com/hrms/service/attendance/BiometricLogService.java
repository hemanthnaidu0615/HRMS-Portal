package com.hrms.service.attendance;

import com.hrms.entity.attendance.BiometricLog;
import com.hrms.repository.attendance.BiometricLogRepository;
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
public class BiometricLogService {

    private final BiometricLogRepository repository;

    public List<BiometricLog> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all BiometricLog for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<BiometricLog> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active BiometricLog for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public BiometricLog getById(UUID id, UUID organizationId) {
        log.debug("Fetching BiometricLog with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("BiometricLog not found with id: " + id));
    }

    public BiometricLog create(BiometricLog entity, UUID organizationId) {
        log.debug("Creating new BiometricLog for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public BiometricLog update(UUID id, BiometricLog entity, UUID organizationId) {
        log.debug("Updating BiometricLog with id: {} for organization: {}", id, organizationId);
        BiometricLog existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting BiometricLog with id: {} for organization: {}", id, organizationId);
        BiometricLog entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting BiometricLog with id: {} for organization: {}", id, organizationId);
        BiometricLog entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
