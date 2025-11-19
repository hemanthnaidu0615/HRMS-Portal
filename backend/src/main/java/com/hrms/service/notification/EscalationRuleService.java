package com.hrms.service.notification;

import com.hrms.entity.notification.EscalationRule;
import com.hrms.repository.notification.EscalationRuleRepository;
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
public class EscalationRuleService {

    private final EscalationRuleRepository repository;

    public List<EscalationRule> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all EscalationRule for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<EscalationRule> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active EscalationRule for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public EscalationRule getById(UUID id, UUID organizationId) {
        log.debug("Fetching EscalationRule with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("EscalationRule not found with id: " + id));
    }

    public EscalationRule create(EscalationRule entity, UUID organizationId) {
        log.debug("Creating new EscalationRule for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public EscalationRule update(UUID id, EscalationRule entity, UUID organizationId) {
        log.debug("Updating EscalationRule with id: {} for organization: {}", id, organizationId);
        EscalationRule existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting EscalationRule with id: {} for organization: {}", id, organizationId);
        EscalationRule entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting EscalationRule with id: {} for organization: {}", id, organizationId);
        EscalationRule entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
