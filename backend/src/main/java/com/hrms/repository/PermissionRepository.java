package com.hrms.repository;

import com.hrms.entity.Organization;
import com.hrms.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    /**
     * Find permission by resource, action, and scope (for system permissions)
     */
    Optional<Permission> findByResourceAndActionAndScopeAndOrganizationIsNull(
        String resource, String action, String scope
    );

    /**
     * Find permission by resource, action, scope, and organization
     */
    Optional<Permission> findByResourceAndActionAndScopeAndOrganization(
        String resource, String action, String scope, Organization organization
    );

    /**
     * Find all system permissions (organization_id = NULL)
     */
    List<Permission> findByOrganizationIsNull();

    /**
     * Find all permissions for an organization (including system permissions)
     */
    @Query("SELECT p FROM Permission p WHERE p.organization IS NULL OR p.organization = :organization")
    List<Permission> findAllAvailableForOrganization(@Param("organization") Organization organization);

    /**
     * Find permissions by resource
     */
    List<Permission> findByResource(String resource);

    /**
     * Find permissions by resource and organization (including system)
     */
    @Query("SELECT p FROM Permission p WHERE p.resource = :resource AND (p.organization IS NULL OR p.organization = :organization)")
    List<Permission> findByResourceAndOrganization(
        @Param("resource") String resource,
        @Param("organization") Organization organization
    );

    /**
     * Get all unique resources
     */
    @Query("SELECT DISTINCT p.resource FROM Permission p WHERE p.organization IS NULL ORDER BY p.resource")
    List<String> findAllResources();

    /**
     * Get all unique actions for a resource
     */
    @Query("SELECT DISTINCT p.action FROM Permission p WHERE p.resource = :resource AND p.organization IS NULL ORDER BY p.action")
    List<String> findActionsByResource(@Param("resource") String resource);

    /**
     * Get all unique scopes
     */
    @Query("SELECT DISTINCT p.scope FROM Permission p WHERE p.organization IS NULL ORDER BY p.scope")
    List<String> findAllScopes();

    /**
     * Find permission by resource, action, scope, and organization ID
     */
    @Query("SELECT p FROM Permission p WHERE p.resource = :resource AND p.action = :action AND p.scope = :scope AND (p.organization.id = :orgId OR (:orgId IS NULL AND p.organization IS NULL))")
    Optional<Permission> findByResourceAndActionAndScopeAndOrganizationId(
        @Param("resource") String resource,
        @Param("action") String action,
        @Param("scope") String scope,
        @Param("orgId") UUID organizationId
    );
}
