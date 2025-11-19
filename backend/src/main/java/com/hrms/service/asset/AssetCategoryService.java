package com.hrms.service.asset;

import com.hrms.entity.asset.AssetCategory;
import com.hrms.repository.asset.AssetCategoryRepository;
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
public class AssetCategoryService {

    private final AssetCategoryRepository repository;

    public List<AssetCategory> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all AssetCategory for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<AssetCategory> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active AssetCategory for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public AssetCategory getById(UUID id, UUID organizationId) {
        log.debug("Fetching AssetCategory with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("AssetCategory not found with id: " + id));
    }

    public AssetCategory create(AssetCategory entity, UUID organizationId) {
        log.debug("Creating new AssetCategory for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public AssetCategory update(UUID id, AssetCategory entity, UUID organizationId) {
        log.debug("Updating AssetCategory with id: {} for organization: {}", id, organizationId);
        AssetCategory existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting AssetCategory with id: {} for organization: {}", id, organizationId);
        AssetCategory entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting AssetCategory with id: {} for organization: {}", id, organizationId);
        AssetCategory entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
