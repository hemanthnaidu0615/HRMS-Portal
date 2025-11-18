package com.hrms.service.payroll;

import com.hrms.entity.payroll.EmployeeSalaryStructure;
import com.hrms.repository.payroll.EmployeeSalaryStructureRepository;
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
public class EmployeeSalaryStructureService {

    private final EmployeeSalaryStructureRepository repository;

    public List<EmployeeSalaryStructure> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all EmployeeSalaryStructure for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<EmployeeSalaryStructure> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active EmployeeSalaryStructure for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public EmployeeSalaryStructure getById(UUID id, UUID organizationId) {
        log.debug("Fetching EmployeeSalaryStructure with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSalaryStructure not found with id: " + id));
    }

    public EmployeeSalaryStructure create(EmployeeSalaryStructure entity, UUID organizationId) {
        log.debug("Creating new EmployeeSalaryStructure for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public EmployeeSalaryStructure update(UUID id, EmployeeSalaryStructure entity, UUID organizationId) {
        log.debug("Updating EmployeeSalaryStructure with id: {} for organization: {}", id, organizationId);
        EmployeeSalaryStructure existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting EmployeeSalaryStructure with id: {} for organization: {}", id, organizationId);
        EmployeeSalaryStructure entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting EmployeeSalaryStructure with id: {} for organization: {}", id, organizationId);
        EmployeeSalaryStructure entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
