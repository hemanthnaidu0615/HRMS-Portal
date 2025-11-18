package com.hrms.repository.expense;

import com.hrms.entity.expense.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, UUID> {

    List<ExpenseCategory> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<ExpenseCategory> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<ExpenseCategory> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM ExpenseCategory e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<ExpenseCategory> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
