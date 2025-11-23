package com.hrms.repository.employee;

import com.hrms.entity.employee.IdentityDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdentityDocumentTypeRepository extends JpaRepository<IdentityDocumentType, UUID> {

    Optional<IdentityDocumentType> findByDocumentTypeCodeAndActiveTrue(String documentTypeCode);

    List<IdentityDocumentType> findByCountryCodeAndActiveTrue(String countryCode);

    List<IdentityDocumentType> findByUniversalTrueAndActiveTrue();

    List<IdentityDocumentType> findByCategoryAndActiveTrue(IdentityDocumentType.DocumentCategory category);

    @Query("SELECT d FROM IdentityDocumentType d WHERE d.active = true " +
           "AND (d.countryCode = :countryCode OR d.universal = true) " +
           "ORDER BY d.universal ASC, d.sortOrder ASC")
    List<IdentityDocumentType> findByCountryCodeOrUniversal(@Param("countryCode") String countryCode);

    @Query("SELECT d FROM IdentityDocumentType d WHERE d.active = true " +
           "AND d.requiredForOnboarding = true " +
           "AND (d.countryCode = :countryCode OR d.universal = true)")
    List<IdentityDocumentType> findRequiredForOnboarding(@Param("countryCode") String countryCode);

    @Query("SELECT d FROM IdentityDocumentType d WHERE d.active = true " +
           "AND d.requiredForPayroll = true " +
           "AND (d.countryCode = :countryCode OR d.universal = true)")
    List<IdentityDocumentType> findRequiredForPayroll(@Param("countryCode") String countryCode);

    List<IdentityDocumentType> findByActiveTrue();

    boolean existsByDocumentTypeCodeAndActiveTrue(String documentTypeCode);
}
