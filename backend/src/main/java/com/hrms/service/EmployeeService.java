package com.hrms.service;

import com.hrms.dto.CreateEmployeeRequest;
import com.hrms.entity.*;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.EmployeeHistoryRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PermissionGroupRepository;
import com.hrms.repository.PositionRepository;
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
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                          EmployeeHistoryRepository employeeHistoryRepository,
                          PermissionGroupRepository permissionGroupRepository,
                          DepartmentRepository departmentRepository,
                          PositionRepository positionRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeHistoryRepository = employeeHistoryRepository;
        this.permissionGroupRepository = permissionGroupRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
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
    public Employee createEmployee(User user, Organization org, CreateEmployeeRequest request) {
        Employee employee = new Employee(user, org);

        // Set personal details
        if (request.getFirstName() != null) {
            employee.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            employee.setLastName(request.getLastName());
        }

        // Set department if provided
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            employee.setDepartment(department);
        }

        // Set position if provided
        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found"));
            employee.setPosition(position);
        }

        // Set manager if provided
        if (request.getReportsToId() != null) {
            Employee manager = employeeRepository.findById(request.getReportsToId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            employee.setReportsTo(manager);
        }

        // Set employment details
        if (request.getEmploymentType() != null) {
            employee.setEmploymentType(request.getEmploymentType());
        }
        if (request.getClientName() != null) {
            employee.setClientName(request.getClientName());
        }
        if (request.getProjectId() != null) {
            employee.setProjectId(request.getProjectId());
        }
        if (request.getContractEndDate() != null) {
            employee.setContractEndDate(request.getContractEndDate());
        }

        // Set probation details
        if (request.getIsProbation() != null && request.getIsProbation()) {
            // Validate probation dates
            if (request.getProbationStartDate() != null && request.getProbationEndDate() != null) {
                if (request.getProbationEndDate().isBefore(request.getProbationStartDate())) {
                    throw new IllegalArgumentException("Probation end date must be after start date");
                }
            }

            employee.setIsProbation(true);
            employee.setProbationStartDate(request.getProbationStartDate());
            employee.setProbationEndDate(request.getProbationEndDate());
            employee.setProbationStatus(request.getProbationStatus() != null ? request.getProbationStatus() : "active");
        }

        // Set permission groups if provided, otherwise use defaults
        if (request.getPermissionGroupIds() != null && !request.getPermissionGroupIds().isEmpty()) {
            List<PermissionGroup> groups = permissionGroupRepository.findAllById(request.getPermissionGroupIds());
            employee.getPermissionGroups().addAll(groups);
        } else {
            // Apply default permission groups
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
    public Employee updateClientName(Employee employee, String clientName, User changedBy) {
        String oldValue = employee.getClientName();
        String newValue = clientName;

        employee.setClientName(clientName);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "client_name", oldValue, newValue, changedBy);
        return updated;
    }

    @Transactional
    public Employee updateProject(Employee employee, String projectId, User changedBy) {
        String oldValue = employee.getProjectId();
        String newValue = projectId;

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

    public Optional<Employee> getByUserId(UUID userId) {
        return employeeRepository.findByUser_Id(userId);
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

    @Transactional
    public Employee extendProbation(Employee employee, LocalDate newEndDate, User changedBy) {
        // Validate new end date
        if (newEndDate == null) {
            throw new IllegalArgumentException("New probation end date cannot be null");
        }
        if (newEndDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("New probation end date cannot be in the past");
        }
        if (employee.getProbationEndDate() != null && newEndDate.isBefore(employee.getProbationEndDate())) {
            throw new IllegalArgumentException("New probation end date must be after the current end date");
        }

        String oldValue = employee.getProbationEndDate() != null ? employee.getProbationEndDate().toString() : null;
        String newValue = newEndDate.toString();

        employee.setProbationEndDate(newEndDate);
        employee.setProbationStatus("extended");
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "probation_end_date", oldValue, newValue, changedBy);
        recordHistory(employee, "probation_status", "active", "extended", changedBy);
        return updated;
    }

    @Transactional
    public Employee completeProbation(Employee employee, User changedBy) {
        String oldStatus = employee.getProbationStatus();

        employee.setProbationStatus("completed");
        employee.setIsProbation(false);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "probation_status", oldStatus, "completed", changedBy);
        recordHistory(employee, "is_probation", "true", "false", changedBy);
        return updated;
    }

    @Transactional
    public Employee terminateProbation(Employee employee, User changedBy) {
        String oldStatus = employee.getProbationStatus();

        employee.setProbationStatus("terminated");
        employee.setIsProbation(false);
        Employee updated = employeeRepository.save(employee);

        recordHistory(employee, "probation_status", oldStatus, "terminated", changedBy);
        recordHistory(employee, "is_probation", "true", "false", changedBy);
        return updated;
    }
}
