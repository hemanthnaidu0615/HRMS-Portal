package com.hrms.repository;

import com.hrms.entity.ProjectTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * ProjectTask Repository
 * Module: PROJECTS
 */
@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM ProjectTask e WHERE e.organizationId = :organizationId")
    Page<ProjectTask> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<ProjectTask> findByOrganizationId(UUID organizationId);

    /**
     * Find tasks by project
     */
    List<ProjectTask> findByProjectId(UUID projectId);

    /**
     * Find tasks by assignee
     */
    List<ProjectTask> findByAssignedTo(UUID assignedTo);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
