package com.hrms.service.attendance;

import com.hrms.entity.attendance.AttendanceRegularizationRequest;
import com.hrms.repository.attendance.AttendanceRegularizationRequestRepository;
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
public class AttendanceRegularizationRequestService {

    private final AttendanceRegularizationRequestRepository repository;

    public List<AttendanceRegularizationRequest> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all AttendanceRegularizationRequest for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<AttendanceRegularizationRequest> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active AttendanceRegularizationRequest for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public AttendanceRegularizationRequest getById(UUID id, UUID organizationId) {
        log.debug("Fetching AttendanceRegularizationRequest with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceRegularizationRequest not found with id: " + id));
    }

    public AttendanceRegularizationRequest create(AttendanceRegularizationRequest entity, UUID organizationId) {
        log.debug("Creating new AttendanceRegularizationRequest for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public AttendanceRegularizationRequest update(UUID id, AttendanceRegularizationRequest entity, UUID organizationId) {
        log.debug("Updating AttendanceRegularizationRequest with id: {} for organization: {}", id, organizationId);
        AttendanceRegularizationRequest existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting AttendanceRegularizationRequest with id: {} for organization: {}", id, organizationId);
        AttendanceRegularizationRequest entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting AttendanceRegularizationRequest with id: {} for organization: {}", id, organizationId);
        AttendanceRegularizationRequest entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
