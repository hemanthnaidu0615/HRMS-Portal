package com.hrms.repository.leave;

import com.hrms.entity.leave.LeaveTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface LeaveTransactionRepository extends JpaRepository<LeaveTransaction, UUID> {

    List<LeaveTransaction> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<LeaveTransaction> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<LeaveTransaction> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM LeaveTransaction e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<LeaveTransaction> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
