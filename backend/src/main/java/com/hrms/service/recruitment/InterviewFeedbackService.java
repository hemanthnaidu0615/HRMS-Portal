package com.hrms.service.recruitment;

import com.hrms.entity.recruitment.InterviewFeedback;
import com.hrms.repository.recruitment.InterviewFeedbackRepository;
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
public class InterviewFeedbackService {

    private final InterviewFeedbackRepository repository;

    public List<InterviewFeedback> getAllByOrganization(UUID organizationId) {
        log.debug("Fetching all InterviewFeedback for organization: {}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    public List<InterviewFeedback> getActiveByOrganization(UUID organizationId) {
        log.debug("Fetching active InterviewFeedback for organization: {}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }

    public InterviewFeedback getById(UUID id, UUID organizationId) {
        log.debug("Fetching InterviewFeedback with id: {} for organization: {}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewFeedback not found with id: " + id));
    }

    public InterviewFeedback create(InterviewFeedback entity, UUID organizationId) {
        log.debug("Creating new InterviewFeedback for organization: {}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }

    public InterviewFeedback update(UUID id, InterviewFeedback entity, UUID organizationId) {
        log.debug("Updating InterviewFeedback with id: {} for organization: {}", id, organizationId);
        InterviewFeedback existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public void delete(UUID id, UUID organizationId) {
        log.debug("Soft deleting InterviewFeedback with id: {} for organization: {}", id, organizationId);
        InterviewFeedback entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }

    public void hardDelete(UUID id, UUID organizationId) {
        log.debug("Hard deleting InterviewFeedback with id: {} for organization: {}", id, organizationId);
        InterviewFeedback entity = getById(id, organizationId);
        repository.delete(entity);
    }
}
