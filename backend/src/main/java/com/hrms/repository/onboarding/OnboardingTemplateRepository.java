package com.hrms.repository.onboarding;

import com.hrms.entity.Organization;
import com.hrms.entity.onboarding.OnboardingTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OnboardingTemplateRepository extends JpaRepository<OnboardingTemplate, UUID> {

    List<OnboardingTemplate> findByOrganizationAndIsActiveTrue(Organization organization);

    Optional<OnboardingTemplate> findByOrganizationAndTemplateCode(Organization organization, String templateCode);

    Optional<OnboardingTemplate> findByOrganizationAndIsDefaultTrue(Organization organization);

    @Query("SELECT t FROM OnboardingTemplate t WHERE t.organization = :org " +
           "AND t.isActive = true " +
           "AND (t.employmentType IS NULL OR t.employmentType = :employmentType) " +
           "AND (t.department IS NULL OR t.department.id = :departmentId) " +
           "AND (t.countryCode IS NULL OR t.countryCode = :countryCode) " +
           "ORDER BY t.isDefault DESC, t.createdAt DESC")
    List<OnboardingTemplate> findMatchingTemplates(
            @Param("org") Organization organization,
            @Param("employmentType") String employmentType,
            @Param("departmentId") UUID departmentId,
            @Param("countryCode") String countryCode);

    @Query("SELECT t FROM OnboardingTemplate t LEFT JOIN FETCH t.steps WHERE t.id = :id")
    Optional<OnboardingTemplate> findByIdWithSteps(@Param("id") UUID id);

    boolean existsByOrganizationAndTemplateCode(Organization organization, String templateCode);
}
