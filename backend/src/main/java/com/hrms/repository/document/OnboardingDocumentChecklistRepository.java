package com.hrms.repository.document;

import com.hrms.model.document.OnboardingDocumentChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OnboardingDocumentChecklistRepository extends JpaRepository<OnboardingDocumentChecklist, Long> {

    @Query("SELECT odc FROM OnboardingDocumentChecklist odc WHERE odc.employee.id = :employeeId ORDER BY odc.displayOrder, odc.createdAt")
    List<OnboardingDocumentChecklist> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT odc FROM OnboardingDocumentChecklist odc WHERE odc.employee.id = :employeeId AND odc.status = :status ORDER BY odc.displayOrder")
    List<OnboardingDocumentChecklist> findByEmployeeIdAndStatus(@Param("employeeId") UUID employeeId, @Param("status") OnboardingDocumentChecklist.ChecklistStatus status);

    @Query("SELECT odc FROM OnboardingDocumentChecklist odc WHERE odc.organization.id = :orgId ORDER BY odc.employee.id, odc.displayOrder")
    List<OnboardingDocumentChecklist> findByOrganizationId(@Param("orgId") UUID orgId);

    @Query("SELECT COUNT(odc) FROM OnboardingDocumentChecklist odc WHERE odc.employee.id = :employeeId")
    long countByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT COUNT(odc) FROM OnboardingDocumentChecklist odc WHERE odc.employee.id = :employeeId AND odc.status = 'COMPLETED'")
    long countCompletedByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT COUNT(odc) FROM OnboardingDocumentChecklist odc WHERE odc.employee.id = :employeeId AND odc.isMandatory = true")
    long countMandatoryByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT COUNT(odc) FROM OnboardingDocumentChecklist odc WHERE odc.employee.id = :employeeId AND odc.isMandatory = true AND odc.status = 'COMPLETED'")
    long countMandatoryCompletedByEmployeeId(@Param("employeeId") UUID employeeId);
}
