package com.hrms.repository.recruitment;

import com.hrms.entity.recruitment.InterviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface InterviewScheduleRepository extends JpaRepository<InterviewSchedule, UUID> {

    List<InterviewSchedule> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<InterviewSchedule> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<InterviewSchedule> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM InterviewSchedule e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<InterviewSchedule> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
