package com.hrms.repository.attendance;

import com.hrms.entity.attendance.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, UUID> {

    List<Shift> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<Shift> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<Shift> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM Shift e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<Shift> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
