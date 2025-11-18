package com.hrms.repository;

import com.hrms.entity.VendorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorAssignmentRepository extends JpaRepository<VendorAssignment, UUID> {

    // Find all assignments for an organization
    @Query("SELECT va FROM VendorAssignment va WHERE va.organization.id = :orgId")
    List<VendorAssignment> findByOrganizationId(@Param("orgId") UUID organizationId);

    // Find active assignments for an organization
    @Query("SELECT va FROM VendorAssignment va WHERE va.organization.id = :orgId AND va.assignmentStatus = 'active'")
    List<VendorAssignment> findActiveByOrganizationId(@Param("orgId") UUID organizationId);

    // Find assignments by employee
    @Query("SELECT va FROM VendorAssignment va WHERE va.employee.id = :employeeId ORDER BY va.assignmentStartDate DESC")
    List<VendorAssignment> findByEmployeeId(@Param("employeeId") UUID employeeId);

    // Find active assignment for employee
    @Query("SELECT va FROM VendorAssignment va WHERE va.employee.id = :employeeId AND va.assignmentStatus = 'active'")
    Optional<VendorAssignment> findActiveByEmployeeId(@Param("employeeId") UUID employeeId);

    // Find assignments by vendor
    @Query("SELECT va FROM VendorAssignment va WHERE va.vendor.id = :vendorId ORDER BY va.assignmentStartDate DESC")
    List<VendorAssignment> findByVendorId(@Param("vendorId") UUID vendorId);

    // Find active assignments by vendor
    @Query("SELECT va FROM VendorAssignment va WHERE va.vendor.id = :vendorId AND va.assignmentStatus = 'active'")
    List<VendorAssignment> findActiveByVendorId(@Param("vendorId") UUID vendorId);

    // Find assignments by client
    @Query("SELECT va FROM VendorAssignment va WHERE va.client.id = :clientId")
    List<VendorAssignment> findByClientId(@Param("clientId") UUID clientId);

    // Find assignments by project
    @Query("SELECT va FROM VendorAssignment va WHERE va.project.id = :projectId")
    List<VendorAssignment> findByProjectId(@Param("projectId") UUID projectId);

    // Find assignments by type
    @Query("SELECT va FROM VendorAssignment va WHERE va.organization.id = :orgId AND va.assignmentType = :type")
    List<VendorAssignment> findByOrganizationIdAndType(@Param("orgId") UUID organizationId, @Param("type") String assignmentType);

    // Count active assignments for vendor
    @Query("SELECT COUNT(va) FROM VendorAssignment va WHERE va.vendor.id = :vendorId AND va.assignmentStatus = 'active'")
    Long countActiveByVendorId(@Param("vendorId") UUID vendorId);

    // Count active assignments for client
    @Query("SELECT COUNT(va) FROM VendorAssignment va WHERE va.client.id = :clientId AND va.assignmentStatus = 'active'")
    Long countActiveByClientId(@Param("clientId") UUID clientId);
}
