package com.hrms.repository;

import com.hrms.entity.Department;
import com.hrms.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    List<Department> findByOrganization(Organization organization);
    List<Department> findByOrganizationAndDeletedAtIsNull(Organization organization);
    Optional<Department> findByOrganizationAndNameAndDeletedAtIsNull(Organization organization, String name);
    long countByOrganizationAndDeletedAtIsNull(Organization organization);

    // Demo data cleanup methods
    int deleteByOrganization(Organization organization);
    long countByOrganization(Organization organization);
}
