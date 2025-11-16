package com.hrms.repository;

import com.hrms.entity.Organization;
import com.hrms.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    /**
     * Find system role by name (organization_id = NULL)
     */
    Optional<Role> findByNameAndSystemRoleTrue(String name);

    /**
     * Find role by name and organization
     */
    Optional<Role> findByNameAndOrganization(String name, Organization organization);

    /**
     * Find all system roles
     */
    List<Role> findBySystemRoleTrue();

    /**
     * Find all roles for an organization (excluding system roles)
     */
    List<Role> findByOrganizationAndSystemRoleFalse(Organization organization);

    /**
     * Find all available roles for an organization (system roles + org roles)
     */
    @Query("SELECT r FROM Role r WHERE r.systemRole = true OR r.organization = :organization")
    List<Role> findAllAvailableForOrganization(@Param("organization") Organization organization);

    /**
     * Check if role name exists in organization
     */
    boolean existsByNameAndOrganization(String name, Organization organization);

    /**
     * Check if system role exists
     */
    boolean existsByNameAndSystemRoleTrue(String name);
}
