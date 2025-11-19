package com.hrms.repository.performance;

import com.hrms.entity.performance.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, UUID> {

    List<PerformanceReview> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<PerformanceReview> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<PerformanceReview> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM PerformanceReview e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<PerformanceReview> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
