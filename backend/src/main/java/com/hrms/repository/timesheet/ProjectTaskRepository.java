package com.hrms.repository.timesheet;

import com.hrms.entity.timesheet.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, UUID> {

    List<ProjectTask> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<ProjectTask> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<ProjectTask> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM ProjectTask e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<ProjectTask> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
