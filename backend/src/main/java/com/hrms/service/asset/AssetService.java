package com.hrms.service.asset;

import com.hrms.entity.asset.Asset;
import com.hrms.repository.asset.AssetRepository;
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
public class AssetService {

    private final AssetRepository repository;

    public List<Asset> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all Asset for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<Asset> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active Asset for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public Asset getById(UUID id, UUID organizationId) {
        log.debug("Fetching Asset with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
    }

    public Asset create(Asset entity, UUID organizationId) {
        log.debug("Creating new Asset for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public Asset update(UUID id, Asset entity, UUID organizationId) {
        log.debug("Updating Asset with id: {} for organization: {}", id, organizationId);
        Asset existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting Asset with id: {} for organization: {}", id, organizationId);
        Asset entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting Asset with id: {} for organization: {}", id, organizationId);
        Asset entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
