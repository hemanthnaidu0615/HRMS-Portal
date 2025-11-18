package com.hrms.service.asset;

import com.hrms.entity.asset.AssetMaintenance;
import com.hrms.repository.asset.AssetMaintenanceRepository;
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
public class AssetMaintenanceService {

    private final AssetMaintenanceRepository repository;

    public List<AssetMaintenance> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all AssetMaintenance for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<AssetMaintenance> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active AssetMaintenance for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public AssetMaintenance getById(UUID id, UUID organizationId) {
        log.debug("Fetching AssetMaintenance with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("AssetMaintenance not found with id: " + id));
    }

    public AssetMaintenance create(AssetMaintenance entity, UUID organizationId) {
        log.debug("Creating new AssetMaintenance for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public AssetMaintenance update(UUID id, AssetMaintenance entity, UUID organizationId) {
        log.debug("Updating AssetMaintenance with id: {} for organization: {}", id, organizationId);
        AssetMaintenance existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting AssetMaintenance with id: {} for organization: {}", id, organizationId);
        AssetMaintenance entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting AssetMaintenance with id: {} for organization: {}", id, organizationId);
        AssetMaintenance entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
