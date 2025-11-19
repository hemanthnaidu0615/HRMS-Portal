package com.hrms.repository.expense;

import com.hrms.entity.expense.ExpenseClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ExpenseClaimRepository extends JpaRepository<ExpenseClaim, UUID> {

    List<ExpenseClaim> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<ExpenseClaim> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<ExpenseClaim> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM ExpenseClaim e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<ExpenseClaim> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
