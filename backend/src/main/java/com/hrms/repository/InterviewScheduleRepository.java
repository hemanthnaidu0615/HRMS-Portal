package com.hrms.repository;

import com.hrms.entity.InterviewSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * InterviewSchedule Repository
 * Module: RECRUITMENT
 */
@Repository
public interface InterviewScheduleRepository extends JpaRepository<InterviewSchedule, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM InterviewSchedule e WHERE e.organizationId = :organizationId")
    Page<InterviewSchedule> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<InterviewSchedule> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
