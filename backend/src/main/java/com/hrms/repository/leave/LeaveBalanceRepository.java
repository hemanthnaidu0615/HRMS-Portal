package com.hrms.repository.leave;

import com.hrms.entity.leave.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {

    List<LeaveBalance> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<LeaveBalance> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<LeaveBalance> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM LeaveBalance e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<LeaveBalance> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
