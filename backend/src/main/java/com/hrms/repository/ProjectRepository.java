package com.hrms.repository;

import com.hrms.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    // Find all projects for an organization (excluding deleted)
    @Query("SELECT p FROM Project p WHERE p.organization.id = :orgId AND p.deletedAt IS NULL")
    List<Project> findByOrganizationId(@Param("orgId") UUID organizationId);

    // Find active projects for an organization
    @Query("SELECT p FROM Project p WHERE p.organization.id = :orgId AND p.projectStatus = 'active' AND p.deletedAt IS NULL")
    List<Project> findActiveByOrganizationId(@Param("orgId") UUID organizationId);

    // Find projects by client
    @Query("SELECT p FROM Project p WHERE p.client.id = :clientId AND p.deletedAt IS NULL")
    List<Project> findByClientId(@Param("clientId") UUID clientId);

    // Find project by code
    @Query("SELECT p FROM Project p WHERE p.projectCode = :code AND p.deletedAt IS NULL")
    Optional<Project> findByProjectCode(@Param("code") String projectCode);

    // Find projects by manager
    @Query("SELECT p FROM Project p WHERE p.projectManager.id = :managerId AND p.deletedAt IS NULL")
    List<Project> findByProjectManagerId(@Param("managerId") UUID projectManagerId);

    // Find projects by status
    @Query("SELECT p FROM Project p WHERE p.organization.id = :orgId AND p.projectStatus = :status AND p.deletedAt IS NULL")
    List<Project> findByOrganizationIdAndStatus(@Param("orgId") UUID organizationId, @Param("status") String status);

    // Find billable projects
    @Query("SELECT p FROM Project p WHERE p.organization.id = :orgId AND p.isBillable = true AND p.projectStatus = 'active' AND p.deletedAt IS NULL")
    List<Project> findBillableByOrganizationId(@Param("orgId") UUID organizationId);

    // Check if project code exists
    boolean existsByProjectCodeAndDeletedAtIsNull(String projectCode);

    // Demo data cleanup methods
    @Query("DELETE FROM Project p WHERE p.organization = :organization")
    int deleteByOrganization(@Param("organization") com.hrms.entity.Organization organization);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.organization = :organization")
    long countByOrganization(@Param("organization") com.hrms.entity.Organization organization);
}
