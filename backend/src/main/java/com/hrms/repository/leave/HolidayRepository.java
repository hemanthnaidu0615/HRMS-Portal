package com.hrms.repository.leave;

import com.hrms.entity.leave.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, UUID> {

    List<Holiday> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<Holiday> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<Holiday> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM Holiday e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<Holiday> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
