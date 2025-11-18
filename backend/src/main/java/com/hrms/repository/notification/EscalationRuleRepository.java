package com.hrms.repository.notification;

import com.hrms.entity.notification.EscalationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface EscalationRuleRepository extends JpaRepository<EscalationRule, UUID> {

    List<EscalationRule> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<EscalationRule> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<EscalationRule> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM EscalationRule e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<EscalationRule> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
