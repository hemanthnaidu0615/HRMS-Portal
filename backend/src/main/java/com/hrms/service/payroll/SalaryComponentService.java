package com.hrms.service.payroll;

import com.hrms.entity.payroll.SalaryComponent;
import com.hrms.repository.payroll.SalaryComponentRepository;
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
public class SalaryComponentService {

    private final SalaryComponentRepository repository;

    public List<SalaryComponent> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all SalaryComponent for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<SalaryComponent> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active SalaryComponent for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public SalaryComponent getById(UUID id, UUID organizationId) {
        log.debug("Fetching SalaryComponent with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryComponent not found with id: " + id));
    }

    public SalaryComponent create(SalaryComponent entity, UUID organizationId) {
        log.debug("Creating new SalaryComponent for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public SalaryComponent update(UUID id, SalaryComponent entity, UUID organizationId) {
        log.debug("Updating SalaryComponent with id: {} for organization: {}", id, organizationId);
        SalaryComponent existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting SalaryComponent with id: {} for organization: {}", id, organizationId);
        SalaryComponent entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting SalaryComponent with id: {} for organization: {}", id, organizationId);
        SalaryComponent entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
