package com.hrms.repository;

import com.hrms.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {

    // Find all clients for an organization (excluding deleted)
    @Query("SELECT c FROM Client c WHERE c.organization.id = :orgId AND c.deletedAt IS NULL")
    List<Client> findByOrganizationId(@Param("orgId") UUID organizationId);

    // Find active clients for an organization
    @Query("SELECT c FROM Client c WHERE c.organization.id = :orgId AND c.isActive = true AND c.deletedAt IS NULL")
    List<Client> findActiveByOrganizationId(@Param("orgId") UUID organizationId);

    // Find strategic clients
    @Query("SELECT c FROM Client c WHERE c.organization.id = :orgId AND c.isStrategic = true AND c.isActive = true AND c.deletedAt IS NULL")
    List<Client> findStrategicByOrganizationId(@Param("orgId") UUID organizationId);

    // Find client by code
    @Query("SELECT c FROM Client c WHERE c.clientCode = :code AND c.deletedAt IS NULL")
    Optional<Client> findByClientCode(@Param("code") String clientCode);

    // Find clients by type
    @Query("SELECT c FROM Client c WHERE c.organization.id = :orgId AND c.clientType = :type AND c.isActive = true AND c.deletedAt IS NULL")
    List<Client> findByOrganizationIdAndType(@Param("orgId") UUID organizationId, @Param("type") String clientType);

    // Find clients by account manager
    @Query("SELECT c FROM Client c WHERE c.accountManager.id = :managerId AND c.deletedAt IS NULL")
    List<Client> findByAccountManagerId(@Param("managerId") UUID accountManagerId);

    // Find clients by industry
    @Query("SELECT c FROM Client c WHERE c.organization.id = :orgId AND c.industry = :industry AND c.isActive = true AND c.deletedAt IS NULL")
    List<Client> findByOrganizationIdAndIndustry(@Param("orgId") UUID organizationId, @Param("industry") String industry);

    // Check if client code exists
    boolean existsByClientCodeAndDeletedAtIsNull(String clientCode);

    // Demo data cleanup methods
    @Query("DELETE FROM Client c WHERE c.organization = :organization")
    int deleteByOrganization(@Param("organization") com.hrms.entity.Organization organization);

    @Query("SELECT COUNT(c) FROM Client c WHERE c.organization = :organization")
    long countByOrganization(@Param("organization") com.hrms.entity.Organization organization);
}
