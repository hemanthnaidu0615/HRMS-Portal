package com.hrms.repository;

import com.hrms.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID> {

    // Find all vendors for an organization (excluding deleted)
    @Query("SELECT v FROM Vendor v WHERE v.organization.id = :orgId AND v.deletedAt IS NULL")
    List<Vendor> findByOrganizationId(@Param("orgId") UUID organizationId);

    // Find active vendors for an organization
    @Query("SELECT v FROM Vendor v WHERE v.organization.id = :orgId AND v.isActive = true AND v.deletedAt IS NULL")
    List<Vendor> findActiveByOrganizationId(@Param("orgId") UUID organizationId);

    // Find preferred vendors
    @Query("SELECT v FROM Vendor v WHERE v.organization.id = :orgId AND v.isPreferred = true AND v.isActive = true AND v.deletedAt IS NULL")
    List<Vendor> findPreferredByOrganizationId(@Param("orgId") UUID organizationId);

    // Find vendor by code
    @Query("SELECT v FROM Vendor v WHERE v.vendorCode = :code AND v.deletedAt IS NULL")
    Optional<Vendor> findByVendorCode(@Param("code") String vendorCode);

    // Find sub-vendors (tier 2+)
    @Query("SELECT v FROM Vendor v WHERE v.parentVendor.id = :parentId AND v.deletedAt IS NULL")
    List<Vendor> findSubVendors(@Param("parentId") UUID parentVendorId);

    // Find vendors by type
    @Query("SELECT v FROM Vendor v WHERE v.organization.id = :orgId AND v.vendorType = :type AND v.isActive = true AND v.deletedAt IS NULL")
    List<Vendor> findByOrganizationIdAndType(@Param("orgId") UUID organizationId, @Param("type") String vendorType);

    // Find vendors with expiring contracts (within next N days)
    @Query("SELECT v FROM Vendor v WHERE v.organization.id = :orgId AND v.contractEndDate BETWEEN CURRENT_DATE AND DATEADD(day, :days, CURRENT_DATE) AND v.contractStatus = 'active' AND v.deletedAt IS NULL")
    List<Vendor> findWithExpiringContracts(@Param("orgId") UUID organizationId, @Param("days") int days);

    // Check if vendor code exists
    boolean existsByVendorCodeAndDeletedAtIsNull(String vendorCode);
}
