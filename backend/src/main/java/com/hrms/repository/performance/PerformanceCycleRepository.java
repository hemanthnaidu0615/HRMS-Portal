package com.hrms.repository.performance;

import com.hrms.entity.performance.PerformanceCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface PerformanceCycleRepository extends JpaRepository<PerformanceCycle, UUID> {

    List<PerformanceCycle> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<PerformanceCycle> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<PerformanceCycle> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM PerformanceCycle e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<PerformanceCycle> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
