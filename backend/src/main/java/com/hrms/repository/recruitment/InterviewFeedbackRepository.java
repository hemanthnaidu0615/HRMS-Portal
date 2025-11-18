package com.hrms.repository.recruitment;

import com.hrms.entity.recruitment.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, UUID> {

    List<InterviewFeedback> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<InterviewFeedback> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<InterviewFeedback> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM InterviewFeedback e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<InterviewFeedback> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
