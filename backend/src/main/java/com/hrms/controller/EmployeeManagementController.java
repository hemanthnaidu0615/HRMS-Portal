package com.hrms.controller;

import com.hrms.dto.*;
import com.hrms.entity.*;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PermissionGroupRepository;
import com.hrms.repository.PositionRepository;
import com.hrms.service.EmployeeService;
import com.hrms.service.PermissionService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orgadmin/employees")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ORGADMIN','SUPERADMIN')")
public class EmployeeManagementController {

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final PermissionService permissionService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<EmployeeSummaryResponse>> getEmployees(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        List<Employee> employees = employeeService.getEmployeesForOrganization(organization);

        List<EmployeeSummaryResponse> response = employees.stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<EmployeeDetailResponse> getEmployee(@PathVariable UUID employeeId,
                                                               Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        Employee employee = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee does not belong to your organization");
        }

        return ResponseEntity.ok(mapToDetail(employee));
    }

    @PatchMapping("/{employeeId}/assignment")
    public ResponseEntity<EmployeeDetailResponse> updateAssignment(@PathVariable UUID employeeId,
                                                                    @Valid @RequestBody EmployeeAssignmentUpdateRequest request,
                                                                    Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        Employee employee = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee does not belong to your organization");
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            if (!department.getOrganization().getId().equals(organization.getId())) {
                throw new RuntimeException("Department does not belong to your organization");
            }
            employeeService.updateDepartment(employee, department, currentUser);
        }

        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found"));
            if (!position.getOrganization().getId().equals(organization.getId())) {
                throw new RuntimeException("Position does not belong to your organization");
            }
            employeeService.updatePosition(employee, position, currentUser);
        }

        if (request.getReportsToEmployeeId() != null) {
            if (request.getReportsToEmployeeId().equals(employeeId)) {
                throw new RuntimeException("Employee cannot report to themselves");
            }
            Employee manager = employeeService.getById(request.getReportsToEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            if (!manager.getOrganization().getId().equals(organization.getId())) {
                throw new RuntimeException("Manager does not belong to your organization");
            }
            employeeService.updateReporting(employee, manager, currentUser);
        }

        if (request.getEmploymentType() != null) {
            employeeService.updateEmploymentType(employee, request.getEmploymentType(), currentUser);
        }

        if (request.getContractEndDate() != null) {
            employeeService.updateContractEndDate(employee, request.getContractEndDate(), currentUser);
        }

        if (request.getClientId() != null) {
            employeeService.updateClient(employee, request.getClientId(), currentUser);
        }

        if (request.getProjectId() != null) {
            employeeService.updateProject(employee, request.getProjectId(), currentUser);
        }

        Employee updated = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return ResponseEntity.ok(mapToDetail(updated));
    }

    @GetMapping("/{employeeId}/history")
    public ResponseEntity<List<EmployeeHistoryResponse>> getEmployeeHistory(@PathVariable UUID employeeId,
                                                                             Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        Employee employee = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee does not belong to your organization");
        }

        List<EmployeeHistory> history = employeeService.getHistoryForEmployee(employee);

        List<EmployeeHistoryResponse> response = history.stream()
                .map(h -> new EmployeeHistoryResponse(
                        h.getId(),
                        h.getChangedField(),
                        h.getOldValue(),
                        h.getNewValue(),
                        h.getChangedAt(),
                        h.getChangedBy() != null ? h.getChangedBy().getEmail() : null
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/tree")
    public ResponseEntity<List<EmployeeTreeNodeResponse>> getEmployeeTree(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        List<Employee> employees = employeeService.getEmployeesForOrganization(organization);

        Map<UUID, EmployeeTreeNodeResponse> nodeMap = new HashMap<>();
        for (Employee emp : employees) {
            EmployeeTreeNodeResponse node = new EmployeeTreeNodeResponse();
            node.setEmployeeId(emp.getId());
            node.setEmail(emp.getUser().getEmail());
            node.setPositionName(emp.getPosition() != null ? emp.getPosition().getName() : null);
            node.setDepartmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null);
            node.setReports(new ArrayList<>());
            nodeMap.put(emp.getId(), node);
        }

        List<EmployeeTreeNodeResponse> roots = new ArrayList<>();
        for (Employee emp : employees) {
            EmployeeTreeNodeResponse node = nodeMap.get(emp.getId());
            if (emp.getReportsTo() == null) {
                roots.add(node);
            } else {
                EmployeeTreeNodeResponse managerNode = nodeMap.get(emp.getReportsTo().getId());
                if (managerNode != null) {
                    managerNode.getReports().add(node);
                } else {
                    roots.add(node);
                }
            }
        }

        return ResponseEntity.ok(roots);
    }

    @GetMapping("/{employeeId}/permissions")
    public ResponseEntity<EmployeePermissionOverviewResponse> getEmployeePermissions(@PathVariable UUID employeeId,
                                                                                      Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        Employee employee = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getOrganization().getId().equals(organization.getId())) {
            return ResponseEntity.status(403).build();
        }

        List<PermissionGroup> assignedGroups = employeeService.getPermissionGroupsForEmployee(employee);
        Set<String> effectivePermissions = permissionService.getEffectivePermissions(employee);

        List<EmployeePermissionGroupResponse> groupResponses = assignedGroups.stream()
                .map(g -> new EmployeePermissionGroupResponse(g.getId(), g.getName(), g.getDescription()))
                .collect(Collectors.toList());

        EmployeePermissionOverviewResponse response = new EmployeePermissionOverviewResponse(
                employee.getId(),
                employee.getUser().getEmail(),
                groupResponses,
                effectivePermissions
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{employeeId}/permission-groups")
    public ResponseEntity<EmployeePermissionOverviewResponse> updateEmployeePermissionGroups(@PathVariable UUID employeeId,
                                                                                              @Valid @RequestBody EmployeePermissionUpdateRequest request,
                                                                                              Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        Employee employee = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getOrganization().getId().equals(organization.getId())) {
            return ResponseEntity.status(403).build();
        }

        List<UUID> groupIds = request.getGroupIds();
        if (groupIds == null) {
            groupIds = new ArrayList<>();
        }

        List<PermissionGroup> groups = new ArrayList<>();
        for (UUID groupId : groupIds) {
            PermissionGroup group = permissionGroupRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Permission group not found: " + groupId));
            groups.add(group);
        }

        employeeService.setPermissionGroupsForEmployee(employee, groups);

        Employee updated = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<PermissionGroup> assignedGroups = employeeService.getPermissionGroupsForEmployee(updated);
        Set<String> effectivePermissions = permissionService.getEffectivePermissions(updated);

        List<EmployeePermissionGroupResponse> groupResponses = assignedGroups.stream()
                .map(g -> new EmployeePermissionGroupResponse(g.getId(), g.getName(), g.getDescription()))
                .collect(Collectors.toList());

        EmployeePermissionOverviewResponse response = new EmployeePermissionOverviewResponse(
                updated.getId(),
                updated.getUser().getEmail(),
                groupResponses,
                effectivePermissions
        );

        return ResponseEntity.ok(response);
    }

    private EmployeeSummaryResponse mapToSummary(Employee employee) {
        return new EmployeeSummaryResponse(
                employee.getId(),
                employee.getUser().getId(),
                employee.getUser().getEmail(),
                employee.getDepartment() != null ? employee.getDepartment().getName() : null,
                employee.getPosition() != null ? employee.getPosition().getName() : null,
                employee.getReportsTo() != null ? employee.getReportsTo().getId() : null,
                employee.getReportsTo() != null ? employee.getReportsTo().getUser().getEmail() : null,
                employee.getEmploymentType(),
                employee.getContractEndDate()
        );
    }

    private EmployeeDetailResponse mapToDetail(Employee employee) {
        return new EmployeeDetailResponse(
                employee.getId(),
                employee.getUser().getId(),
                employee.getUser().getEmail(),
                employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                employee.getDepartment() != null ? employee.getDepartment().getName() : null,
                employee.getPosition() != null ? employee.getPosition().getId() : null,
                employee.getPosition() != null ? employee.getPosition().getName() : null,
                employee.getReportsTo() != null ? employee.getReportsTo().getId() : null,
                employee.getReportsTo() != null ? employee.getReportsTo().getUser().getEmail() : null,
                employee.getEmploymentType(),
                employee.getClientId(),
                employee.getProjectId(),
                employee.getContractEndDate()
        );
    }
}
