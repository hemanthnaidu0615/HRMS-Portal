package com.hrms.service.attendance;

import com.hrms.entity.attendance.AttendanceRecord;
import com.hrms.repository.attendance.AttendanceRecordRepository;
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
public class AttendanceRecordService {

    private final AttendanceRecordRepository repository;

    public List<AttendanceRecord> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all AttendanceRecord for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<AttendanceRecord> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active AttendanceRecord for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public AttendanceRecord getById(UUID id, UUID organizationId) {
        log.debug("Fetching AttendanceRecord with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceRecord not found with id: " + id));
    }

    public AttendanceRecord create(AttendanceRecord entity, UUID organizationId) {
        log.debug("Creating new AttendanceRecord for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public AttendanceRecord update(UUID id, AttendanceRecord entity, UUID organizationId) {
        log.debug("Updating AttendanceRecord with id: {} for organization: {}", id, organizationId);
        AttendanceRecord existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting AttendanceRecord with id: {} for organization: {}", id, organizationId);
        AttendanceRecord entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting AttendanceRecord with id: {} for organization: {}", id, organizationId);
        AttendanceRecord entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
