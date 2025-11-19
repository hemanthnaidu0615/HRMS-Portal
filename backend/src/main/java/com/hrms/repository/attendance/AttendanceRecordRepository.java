package com.hrms.repository.attendance;

import com.hrms.entity.attendance.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    List<AttendanceRecord> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<AttendanceRecord> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<AttendanceRecord> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM AttendanceRecord e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<AttendanceRecord> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
