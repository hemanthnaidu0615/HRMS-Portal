package com.hrms.service.leave;

import com.hrms.entity.leave.CompensatoryOffCredit;
import com.hrms.repository.leave.CompensatoryOffCreditRepository;
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
public class CompensatoryOffCreditService {

    private final CompensatoryOffCreditRepository repository;

    public List<CompensatoryOffCredit> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all CompensatoryOffCredit for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<CompensatoryOffCredit> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active CompensatoryOffCredit for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public CompensatoryOffCredit getById(UUID id, UUID organizationId) {
        log.debug("Fetching CompensatoryOffCredit with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("CompensatoryOffCredit not found with id: " + id));
    }

    public CompensatoryOffCredit create(CompensatoryOffCredit entity, UUID organizationId) {
        log.debug("Creating new CompensatoryOffCredit for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public CompensatoryOffCredit update(UUID id, CompensatoryOffCredit entity, UUID organizationId) {
        log.debug("Updating CompensatoryOffCredit with id: {} for organization: {}", id, organizationId);
        CompensatoryOffCredit existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting CompensatoryOffCredit with id: {} for organization: {}", id, organizationId);
        CompensatoryOffCredit entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting CompensatoryOffCredit with id: {} for organization: {}", id, organizationId);
        CompensatoryOffCredit entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
