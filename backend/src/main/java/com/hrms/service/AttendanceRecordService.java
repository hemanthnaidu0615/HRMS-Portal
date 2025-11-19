package com.hrms.service;

import com.hrms.entity.AttendanceRecord;
import com.hrms.repository.AttendanceRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * AttendanceRecord Service
 * Module: ATTENDANCE
 */
@Service
@Transactional
public class AttendanceRecordService {

    @Autowired
    private AttendanceRecordRepository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<AttendanceRecord> getByOrganization(UUID organizationId, Pageable pageable) {
        return repository.findByOrganizationId(organizationId, pageable);
    }

    /**
     * Get all records by organization
     */
    public List<AttendanceRecord> getAllByOrganization(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    /**
     * Get record by ID
     */
    public Optional<AttendanceRecord> getById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Create new record
     */
    public AttendanceRecord create(AttendanceRecord entity) {
        return repository.save(entity);
    }

    /**
     * Update existing record
     */
    public AttendanceRecord update(UUID id, AttendanceRecord updatedEntity) {
        return repository.findById(id)
            .map(existing -> {
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            })
            .orElseThrow(() -> new RuntimeException("AttendanceRecord not found with id: " + id));
    }

    /**
     * Delete record
     */
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    /**
     * Count records by organization
     */
    public Long countByOrganization(UUID organizationId) {
        return repository.countByOrganizationId(organizationId);
    }
}
