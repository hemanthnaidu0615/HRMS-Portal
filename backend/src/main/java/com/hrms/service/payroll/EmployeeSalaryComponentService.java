package com.hrms.service.payroll;

import com.hrms.entity.payroll.EmployeeSalaryComponent;
import com.hrms.repository.payroll.EmployeeSalaryComponentRepository;
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
public class EmployeeSalaryComponentService {

    private final EmployeeSalaryComponentRepository repository;

    public List<EmployeeSalaryComponent> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all EmployeeSalaryComponent for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<EmployeeSalaryComponent> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active EmployeeSalaryComponent for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public EmployeeSalaryComponent getById(UUID id, UUID organizationId) {
        log.debug("Fetching EmployeeSalaryComponent with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSalaryComponent not found with id: " + id));
    }

    public EmployeeSalaryComponent create(EmployeeSalaryComponent entity, UUID organizationId) {
        log.debug("Creating new EmployeeSalaryComponent for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public EmployeeSalaryComponent update(UUID id, EmployeeSalaryComponent entity, UUID organizationId) {
        log.debug("Updating EmployeeSalaryComponent with id: {} for organization: {}", id, organizationId);
        EmployeeSalaryComponent existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting EmployeeSalaryComponent with id: {} for organization: {}", id, organizationId);
        EmployeeSalaryComponent entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting EmployeeSalaryComponent with id: {} for organization: {}", id, organizationId);
        EmployeeSalaryComponent entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
