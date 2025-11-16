package com.hrms.service;

import com.hrms.entity.*;
import com.hrms.repository.EmployeeHistoryRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PermissionGroupRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeHistoryRepository employeeHistoryRepository;
    private final PermissionGroupRepository permissionGroupRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                          EmployeeHistoryRepository employeeHistoryRepository,
                          PermissionGroupRepository permissionGroupRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeHistoryRepository = employeeHistoryRepository;
        this.permissionGroupRepository = permissionGroupRepository;
    }

    @Transactional
    public Employee createEmployee(User user, Organization org) {
        Employee employee = new Employee(user, org);

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("orgadmin") || role.getName().equals("superadmin"));

        if (isAdmin) {
            PermissionGroup orgAdminFull = permissionGroupRepository.findByName("ORG_ADMIN_FULL")
                    .orElseThrow(() -> new RuntimeException("ORG_ADMIN_FULL group not found"));
            employee.getPermissionGroups().add(orgAdminFull);
        } else {
            PermissionGroup employeeBasic = permissionGroupRepository.findByName("EMPLOYEE_BASIC")
                    .orElseThrow(() -> new RuntimeException("EMPLOYEE_BASIC group not found"));
            employee.getPermissionGroups().add(employeeBasic);
        }

        return employeeRepository.save(employee);
    }

    @Transactional
    @CacheEvict(value = "reportingTrees", allEntries = true)
    public Employee updateReporting(Employee employee, Employee reportsTo, User changedBy) {
        String oldValue = employee.getReportsTo() != null ? employee.getReportsTo().getId().toString() : null;
        String newValue = reportsTo != null ? reportsTo.getId().toString() : null;

        employee.setReportsTo(reportsTo);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "reports_to", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateDepartment(Employee employee, Department dept, User changedBy) {
        String oldValue = employee.getDepartment() != null ? employee.getDepartment().getId().toString() : null;
        String newValue = dept != null ? dept.getId().toString() : null;

        employee.setDepartment(dept);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "department_id", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updatePosition(Employee employee, Position pos, User changedBy) {
        String oldValue = employee.getPosition() != null ? employee.getPosition().getId().toString() : null;
        String newValue = pos != null ? pos.getId().toString() : null;

        employee.setPosition(pos);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "position_id", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateEmploymentType(Employee employee, String type, User changedBy) {
        String oldValue = employee.getEmploymentType();
        String newValue = type;

        employee.setEmploymentType(type);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "employment_type", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateContractEndDate(Employee employee, LocalDate endDate, User changedBy) {
        String oldValue = employee.getContractEndDate() != null ? employee.getContractEndDate().toString() : null;
        String newValue = endDate != null ? endDate.toString() : null;

        employee.setContractEndDate(endDate);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "contract_end_date", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateClient(Employee employee, UUID clientId, User changedBy) {
        String oldValue = employee.getClientId() != null ? employee.getClientId().toString() : null;
        String newValue = clientId != null ? clientId.toString() : null;

        employee.setClientId(clientId);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "client_id", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateProject(Employee employee, UUID projectId, User changedBy) {
        String oldValue = employee.getProjectId() != null ? employee.getProjectId().toString() : null;
        String newValue = projectId != null ? projectId.toString() : null;

        employee.setProjectId(projectId);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "project_id", oldValue, newValue, changedBy);
        return updated;
    }

    /**
     * Check if assigning newManagerId as manager would create a circular reporting structure
     */
    public boolean wouldCreateCycle(UUID newManagerId, UUID employeeId) {
        if (newManagerId.equals(employeeId)) {
            return true; // Self-reference
        }

        Set<UUID> visited = new HashSet<>();
        UUID current = newManagerId;

        while (current != null) {
            if (current.equals(employeeId)) {
                return true; // Cycle detected: employee would be in their own management chain
            }

            if (!visited.add(current)) {
                // We've seen this ID before, there's a loop but it doesn't involve our employee
                return false;
            }

            Optional<Employee> manager = employeeRepository.findById(current);
            current = manager
                .flatMap(m -> Optional.ofNullable(m.getReportsTo()))
                .map(Employee::getId)
                .orElse(null);
        }

        return false;
    }

    @Cacheable(value = "reportingTrees", key = "#employeeId")
    public List<Employee> getReportingTree(UUID employeeId) {
        Employee manager = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Optimized: Load all employees in organization once (single query)
        List<Employee> allEmployees = employeeRepository.findByOrganization(manager.getOrganization());

        // Build tree in memory instead of recursive DB queries
        return collectReportsInMemory(employeeId, allEmployees);
    }

    private void collectReports(UUID managerId, List<Employee> tree) {
        List<Employee> directReports = employeeRepository.findByReportsToId(managerId);
        for (Employee report : directReports) {
            tree.add(report);
            collectReports(report.getId(), tree);
        }
    }

    private List<Employee> collectReportsInMemory(UUID managerId, List<Employee> allEmployees) {
        List<Employee> tree = new ArrayList<>();

        // Find direct reports in memory
        for (Employee emp : allEmployees) {
            if (emp.getReportsTo() != null && emp.getReportsTo().getId().equals(managerId)) {
                tree.add(emp);
                // Recursively collect their reports
                tree.addAll(collectReportsInMemory(emp.getId(), allEmployees));
            }
        }

        return tree;
    }

    public List<Employee> getEmployeesForOrganization(Organization organization) {
        return employeeRepository.findByOrganization(organization);
    }

    public Page<Employee> getEmployeesForOrganization(Organization organization, Pageable pageable) {
        return employeeRepository.findByOrganization(organization, pageable);
    }

    public Optional<Employee> getById(UUID employeeId) {
        return employeeRepository.findById(employeeId);
    }

    public List<EmployeeHistory> getHistoryForEmployee(Employee employee) {
        return employeeHistoryRepository.findByEmployeeOrderByChangedAtDesc(employee);
    }

    @Transactional
    public void recordHistory(Employee employee, String field, String oldValue, String newValue, User changedBy) {
        EmployeeHistory history = new EmployeeHistory(employee, field, oldValue, newValue, changedBy);
        employeeHistoryRepository.save(history);
    }

    public List<PermissionGroup> getPermissionGroupsForEmployee(Employee employee) {
        return new ArrayList<>(employee.getPermissionGroups());
    }

    @Transactional
    public void setPermissionGroupsForEmployee(Employee employee, List<PermissionGroup> groups) {
        employee.getPermissionGroups().clear();
        employee.getPermissionGroups().addAll(groups);
        employeeRepository.save(employee);
    }
}
