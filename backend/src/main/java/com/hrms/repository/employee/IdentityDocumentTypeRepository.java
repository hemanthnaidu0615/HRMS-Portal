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

    Optional<IdentityDocumentType> findByDocumentCodeAndIsActiveTrue(String documentCode);

    List<IdentityDocumentType> findByCountryCodeAndIsActiveTrue(String countryCode);

    List<IdentityDocumentType> findByIsUniversalTrueAndIsActiveTrue();

    List<IdentityDocumentType> findByCategoryAndIsActiveTrue(IdentityDocumentType.DocumentCategory category);

    @Query("SELECT d FROM IdentityDocumentType d WHERE d.isActive = true " +
           "AND (d.countryCode = :countryCode OR d.isUniversal = true) " +
           "ORDER BY d.isUniversal ASC, d.sortOrder ASC")
    List<IdentityDocumentType> findByCountryCodeOrUniversal(@Param("countryCode") String countryCode);

    @Query("SELECT d FROM IdentityDocumentType d WHERE d.isActive = true " +
           "AND d.isRequiredForOnboarding = true " +
           "AND (d.countryCode = :countryCode OR d.isUniversal = true)")
    List<IdentityDocumentType> findRequiredForOnboarding(@Param("countryCode") String countryCode);

    @Query("SELECT d FROM IdentityDocumentType d WHERE d.isActive = true " +
           "AND d.isRequiredForPayroll = true " +
           "AND (d.countryCode = :countryCode OR d.isUniversal = true)")
    List<IdentityDocumentType> findRequiredForPayroll(@Param("countryCode") String countryCode);

    List<IdentityDocumentType> findByIsActiveTrue();

    boolean existsByDocumentCodeAndIsActiveTrue(String documentCode);
}
