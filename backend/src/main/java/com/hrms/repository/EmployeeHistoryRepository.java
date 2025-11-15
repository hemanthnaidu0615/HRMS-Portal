package com.hrms.repository;

import com.hrms.entity.Employee;
import com.hrms.entity.EmployeeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeHistoryRepository extends JpaRepository<EmployeeHistory, UUID> {
    List<EmployeeHistory> findByEmployeeOrderByChangedAtDesc(Employee employee);
}
