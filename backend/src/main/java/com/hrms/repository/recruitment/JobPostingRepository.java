package com.hrms.repository.recruitment;

import com.hrms.entity.recruitment.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {

    List<JobPosting> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<JobPosting> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<JobPosting> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM JobPosting e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<JobPosting> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
