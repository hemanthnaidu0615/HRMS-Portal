package com.hrms.service.attendance;

import com.hrms.entity.attendance.AttendanceSummary;
import com.hrms.repository.attendance.AttendanceSummaryRepository;
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
public class AttendanceSummaryService {

    private final AttendanceSummaryRepository repository;

    public List<AttendanceSummary> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all AttendanceSummary for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<AttendanceSummary> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active AttendanceSummary for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public AttendanceSummary getById(UUID id, UUID organizationId) {
        log.debug("Fetching AttendanceSummary with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceSummary not found with id: " + id));
    }

    public AttendanceSummary create(AttendanceSummary entity, UUID organizationId) {
        log.debug("Creating new AttendanceSummary for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public AttendanceSummary update(UUID id, AttendanceSummary entity, UUID organizationId) {
        log.debug("Updating AttendanceSummary with id: {} for organization: {}", id, organizationId);
        AttendanceSummary existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting AttendanceSummary with id: {} for organization: {}", id, organizationId);
        AttendanceSummary entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting AttendanceSummary with id: {} for organization: {}", id, organizationId);
        AttendanceSummary entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
