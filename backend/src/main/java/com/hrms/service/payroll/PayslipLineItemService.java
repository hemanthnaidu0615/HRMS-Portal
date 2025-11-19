package com.hrms.service.payroll;

import com.hrms.entity.payroll.PayslipLineItem;
import com.hrms.repository.payroll.PayslipLineItemRepository;
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
public class PayslipLineItemService {

    private final PayslipLineItemRepository repository;

    public List<PayslipLineItem> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all PayslipLineItem for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<PayslipLineItem> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active PayslipLineItem for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public PayslipLineItem getById(UUID id, UUID organizationId) {
        log.debug("Fetching PayslipLineItem with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("PayslipLineItem not found with id: " + id));
    }

    public PayslipLineItem create(PayslipLineItem entity, UUID organizationId) {
        log.debug("Creating new PayslipLineItem for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public PayslipLineItem update(UUID id, PayslipLineItem entity, UUID organizationId) {
        log.debug("Updating PayslipLineItem with id: {} for organization: {}", id, organizationId);
        PayslipLineItem existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting PayslipLineItem with id: {} for organization: {}", id, organizationId);
        PayslipLineItem entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting PayslipLineItem with id: {} for organization: {}", id, organizationId);
        PayslipLineItem entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
