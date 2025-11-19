package com.hrms.repository.attendance;

import com.hrms.entity.attendance.AttendanceRegularizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface AttendanceRegularizationRequestRepository extends JpaRepository<AttendanceRegularizationRequest, UUID> {

    List<AttendanceRegularizationRequest> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<AttendanceRegularizationRequest> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<AttendanceRegularizationRequest> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM AttendanceRegularizationRequest e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<AttendanceRegularizationRequest> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
