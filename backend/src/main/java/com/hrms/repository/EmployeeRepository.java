package com.hrms.repository;

import com.hrms.entity.Department;
import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    Optional<Employee> findByUser(User user);
    Optional<Employee> findByUser_Id(UUID userId);
    List<Employee> findByReportsToId(UUID managerId);
    List<Employee> findByOrganization(Organization organization);
    Page<Employee> findByOrganization(Organization organization, Pageable pageable);
    List<Employee> findByDepartment(Department department);
}
