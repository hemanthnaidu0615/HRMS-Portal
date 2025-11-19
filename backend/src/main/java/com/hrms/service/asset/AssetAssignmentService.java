package com.hrms.service.asset;

import com.hrms.entity.asset.AssetAssignment;
import com.hrms.repository.asset.AssetAssignmentRepository;
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
public class AssetAssignmentService {

    private final AssetAssignmentRepository repository;

    public List<AssetAssignment> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all AssetAssignment for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<AssetAssignment> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active AssetAssignment for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public AssetAssignment getById(UUID id, UUID organizationId) {
        log.debug("Fetching AssetAssignment with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("AssetAssignment not found with id: " + id));
    }

    public AssetAssignment create(AssetAssignment entity, UUID organizationId) {
        log.debug("Creating new AssetAssignment for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public AssetAssignment update(UUID id, AssetAssignment entity, UUID organizationId) {
        log.debug("Updating AssetAssignment with id: {} for organization: {}", id, organizationId);
        AssetAssignment existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting AssetAssignment with id: {} for organization: {}", id, organizationId);
        AssetAssignment entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting AssetAssignment with id: {} for organization: {}", id, organizationId);
        AssetAssignment entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
