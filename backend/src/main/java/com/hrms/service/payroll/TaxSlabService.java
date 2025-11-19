package com.hrms.service.payroll;

import com.hrms.entity.payroll.TaxSlab;
import com.hrms.repository.payroll.TaxSlabRepository;
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
public class TaxSlabService {

    private final TaxSlabRepository repository;

    public List<TaxSlab> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all TaxSlab for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<TaxSlab> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active TaxSlab for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public TaxSlab getById(UUID id, UUID organizationId) {
        log.debug("Fetching TaxSlab with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("TaxSlab not found with id: " + id));
    }

    public TaxSlab create(TaxSlab entity, UUID organizationId) {
        log.debug("Creating new TaxSlab for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public TaxSlab update(UUID id, TaxSlab entity, UUID organizationId) {
        log.debug("Updating TaxSlab with id: {} for organization: {}", id, organizationId);
        TaxSlab existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting TaxSlab with id: {} for organization: {}", id, organizationId);
        TaxSlab entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting TaxSlab with id: {} for organization: {}", id, organizationId);
        TaxSlab entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
