package com.hrms.repository.document;

import com.hrms.model.document.DocumentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentTemplateRepository extends JpaRepository<DocumentTemplate, UUID> {

    @Query("SELECT dt FROM DocumentTemplate dt WHERE dt.organization.id = :orgId AND dt.deletedAt IS NULL")
    List<DocumentTemplate> findByOrganizationId(@Param("orgId") UUID orgId);

    @Query("SELECT dt FROM DocumentTemplate dt WHERE dt.organization.id = :orgId AND dt.isActive = true AND dt.deletedAt IS NULL")
    List<DocumentTemplate> findActiveByOrganizationId(@Param("orgId") UUID orgId);

    @Query("SELECT dt FROM DocumentTemplate dt WHERE dt.organization.id = :orgId AND dt.documentType = :type AND dt.isActive = true AND dt.deletedAt IS NULL")
    List<DocumentTemplate> findByOrganizationIdAndType(@Param("orgId") UUID orgId, @Param("type") DocumentTemplate.DocumentType type);

    @Query("SELECT dt FROM DocumentTemplate dt WHERE dt.organization.id = :orgId AND dt.autoSendOnHire = true AND dt.isActive = true AND dt.deletedAt IS NULL ORDER BY dt.sendOrder ASC")
    List<DocumentTemplate> findAutoSendTemplates(@Param("orgId") UUID orgId);

    @Query("SELECT dt FROM DocumentTemplate dt WHERE dt.id = :id AND dt.deletedAt IS NULL")
    Optional<DocumentTemplate> findByIdNotDeleted(@Param("id") UUID id);
}
