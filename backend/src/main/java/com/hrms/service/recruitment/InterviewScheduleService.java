package com.hrms.service.recruitment;

import com.hrms.entity.recruitment.InterviewSchedule;
import com.hrms.repository.recruitment.InterviewScheduleRepository;
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
public class InterviewScheduleService {

    private final InterviewScheduleRepository repository;

    public List<InterviewSchedule> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all InterviewSchedule for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<InterviewSchedule> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active InterviewSchedule for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public InterviewSchedule getById(UUID id, UUID organizationId) {
        log.debug("Fetching InterviewSchedule with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSchedule not found with id: " + id));
    }

    public InterviewSchedule create(InterviewSchedule entity, UUID organizationId) {
        log.debug("Creating new InterviewSchedule for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public InterviewSchedule update(UUID id, InterviewSchedule entity, UUID organizationId) {
        log.debug("Updating InterviewSchedule with id: {} for organization: {}", id, organizationId);
        InterviewSchedule existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting InterviewSchedule with id: {} for organization: {}", id, organizationId);
        InterviewSchedule entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting InterviewSchedule with id: {} for organization: {}", id, organizationId);
        InterviewSchedule entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
