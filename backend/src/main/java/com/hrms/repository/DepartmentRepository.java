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
    Optional<Department> findByOrganizationAndName(Organization organization, String name);
}
