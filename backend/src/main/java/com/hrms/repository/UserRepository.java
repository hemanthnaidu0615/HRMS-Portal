package com.hrms.repository;

import com.hrms.entity.Organization;
import com.hrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    List<User> findByOrganizationId(UUID organizationId);
    long countByOrganizationAndEnabledTrue(Organization organization);

    // Role-based queries
    List<User> findByOrganizationAndRoles_Name(Organization organization, String roleName);
    long countByOrganizationAndRoles_NameAndEnabledTrue(Organization organization, String roleName);

    // Demo data cleanup methods
    int deleteByOrganization(Organization organization);
    long countByOrganization(Organization organization);
}
