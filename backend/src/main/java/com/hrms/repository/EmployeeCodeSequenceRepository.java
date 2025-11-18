package com.hrms.repository;

import com.hrms.entity.Department;
import com.hrms.entity.EmployeeCodeSequence;
import com.hrms.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeCodeSequenceRepository extends JpaRepository<EmployeeCodeSequence, UUID> {

    /**
     * Find sequence for department with pessimistic lock to prevent race conditions
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<EmployeeCodeSequence> findByOrganizationAndDepartment(Organization organization, Department department);

    /**
     * Find sequence for organization (for employees without department)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<EmployeeCodeSequence> findByOrganizationAndDepartmentIsNull(Organization organization);
}
