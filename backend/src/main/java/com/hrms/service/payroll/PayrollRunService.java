package com.hrms.service.payroll;

import com.hrms.entity.payroll.PayrollRun;
import com.hrms.repository.payroll.PayrollRunRepository;
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
public class PayrollRunService {

    private final PayrollRunRepository repository;

    public List<PayrollRun> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all PayrollRun for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<PayrollRun> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active PayrollRun for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public PayrollRun getById(UUID id, UUID organizationId) {
        log.debug("Fetching PayrollRun with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("PayrollRun not found with id: " + id));
    }

    public PayrollRun create(PayrollRun entity, UUID organizationId) {
        log.debug("Creating new PayrollRun for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public PayrollRun update(UUID id, PayrollRun entity, UUID organizationId) {
        log.debug("Updating PayrollRun with id: {} for organization: {}", id, organizationId);
        PayrollRun existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting PayrollRun with id: {} for organization: {}", id, organizationId);
        PayrollRun entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting PayrollRun with id: {} for organization: {}", id, organizationId);
        PayrollRun entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
