package com.hrms.repository.document;

import com.hrms.model.document.EmployeeDocumentToSign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeDocumentToSignRepository extends JpaRepository<EmployeeDocumentToSign, UUID> {

    @Query("SELECT ed FROM EmployeeDocumentToSign ed WHERE ed.employee.id = :employeeId ORDER BY ed.createdAt DESC")
    List<EmployeeDocumentToSign> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT ed FROM EmployeeDocumentToSign ed WHERE ed.employee.id = :employeeId AND ed.status = :status ORDER BY ed.createdAt DESC")
    List<EmployeeDocumentToSign> findByEmployeeIdAndStatus(@Param("employeeId") UUID employeeId, @Param("status") EmployeeDocumentToSign.DocumentStatus status);

    @Query("SELECT ed FROM EmployeeDocumentToSign ed WHERE ed.organization.id = :orgId ORDER BY ed.createdAt DESC")
    List<EmployeeDocumentToSign> findByOrganizationId(@Param("orgId") UUID orgId);

    @Query("SELECT ed FROM EmployeeDocumentToSign ed WHERE ed.organization.id = :orgId AND ed.status IN (:statuses) ORDER BY ed.createdAt DESC")
    List<EmployeeDocumentToSign> findByOrganizationIdAndStatusIn(@Param("orgId") UUID orgId, @Param("statuses") List<EmployeeDocumentToSign.DocumentStatus> statuses);

    @Query("SELECT ed FROM EmployeeDocumentToSign ed WHERE ed.status IN ('SENT', 'VIEWED') AND ed.expiryDate IS NOT NULL AND ed.expiryDate < :now")
    List<EmployeeDocumentToSign> findExpiredDocuments(@Param("now") LocalDateTime now);

    @Query("SELECT ed FROM EmployeeDocumentToSign ed WHERE ed.status IN ('SENT', 'VIEWED') AND ed.expiryDate > :now AND (ed.lastReminderSent IS NULL OR ed.lastReminderSent < :reminderThreshold)")
    List<EmployeeDocumentToSign> findDocumentsNeedingReminder(@Param("now") LocalDateTime now, @Param("reminderThreshold") LocalDateTime reminderThreshold);

    @Query("SELECT COUNT(ed) FROM EmployeeDocumentToSign ed WHERE ed.employee.id = :employeeId AND ed.status IN ('PENDING', 'SENT', 'VIEWED')")
    long countPendingByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT COUNT(ed) FROM EmployeeDocumentToSign ed WHERE ed.organization.id = :orgId AND ed.status IN ('PENDING', 'SENT', 'VIEWED')")
    long countPendingByOrganizationId(@Param("orgId") UUID orgId);
}
