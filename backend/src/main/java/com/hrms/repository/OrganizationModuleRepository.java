package com.hrms.repository;

import com.hrms.entity.Organization;
import com.hrms.entity.OrganizationModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationModuleRepository extends JpaRepository<OrganizationModule, Long> {

    List<OrganizationModule> findByOrganizationId(UUID organizationId);

    Optional<OrganizationModule> findByOrganizationAndModuleName(Organization organization, String moduleName);

    List<OrganizationModule> findByOrganizationAndIsEnabled(Organization organization, Boolean isEnabled);

    long countByOrganizationAndIsEnabled(Organization organization, Boolean isEnabled);
}
