package com.hrms.service.performance;

import com.hrms.entity.performance.CalibrationSession;
import com.hrms.repository.performance.CalibrationSessionRepository;
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
public class CalibrationSessionService {

    private final CalibrationSessionRepository repository;

    public List<CalibrationSession> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all CalibrationSession for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<CalibrationSession> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active CalibrationSession for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public CalibrationSession getById(UUID id, UUID organizationId) {
        log.debug("Fetching CalibrationSession with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("CalibrationSession not found with id: " + id));
    }

    public CalibrationSession create(CalibrationSession entity, UUID organizationId) {
        log.debug("Creating new CalibrationSession for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public CalibrationSession update(UUID id, CalibrationSession entity, UUID organizationId) {
        log.debug("Updating CalibrationSession with id: {} for organization: {}", id, organizationId);
        CalibrationSession existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting CalibrationSession with id: {} for organization: {}", id, organizationId);
        CalibrationSession entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting CalibrationSession with id: {} for organization: {}", id, organizationId);
        CalibrationSession entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
