package com.hrms.service.payroll;

import com.hrms.entity.payroll.Payslip;
import com.hrms.repository.payroll.PayslipRepository;
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
public class PayslipService {

    private final PayslipRepository repository;

    public List<Payslip> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all Payslip for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<Payslip> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active Payslip for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public Payslip getById(UUID id, UUID organizationId) {
        log.debug("Fetching Payslip with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip not found with id: " + id));
    }

    public Payslip create(Payslip entity, UUID organizationId) {
        log.debug("Creating new Payslip for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public Payslip update(UUID id, Payslip entity, UUID organizationId) {
        log.debug("Updating Payslip with id: {} for organization: {}", id, organizationId);
        Payslip existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting Payslip with id: {} for organization: {}", id, organizationId);
        Payslip entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting Payslip with id: {} for organization: {}", id, organizationId);
        Payslip entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
