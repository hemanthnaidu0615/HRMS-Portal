package com.hrms.repository.expense;

import com.hrms.entity.expense.ExpenseClaimItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ExpenseClaimItemRepository extends JpaRepository<ExpenseClaimItem, UUID> {

    List<ExpenseClaimItem> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<ExpenseClaimItem> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<ExpenseClaimItem> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM ExpenseClaimItem e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<ExpenseClaimItem> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
