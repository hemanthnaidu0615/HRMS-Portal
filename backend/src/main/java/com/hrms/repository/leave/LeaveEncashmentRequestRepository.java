package com.hrms.repository.leave;

import com.hrms.entity.leave.LeaveEncashmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface LeaveEncashmentRequestRepository extends JpaRepository<LeaveEncashmentRequest, UUID> {

    List<LeaveEncashmentRequest> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<LeaveEncashmentRequest> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<LeaveEncashmentRequest> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM LeaveEncashmentRequest e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<LeaveEncashmentRequest> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
