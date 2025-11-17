package com.hrms.controller;

import com.hrms.dto.*;
import com.hrms.entity.*;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PermissionGroupRepository;
import com.hrms.repository.PositionRepository;
import com.hrms.repository.RoleRepository;
import com.hrms.service.EmployeeService;
import com.hrms.service.PermissionService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orgadmin/employees")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ORGADMIN')")
public class EmployeeManagementController {

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final RoleRepository roleRepository;
    private final PermissionService permissionService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<EmployeeSummaryResponse>> getEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        // Limit max page size to 100 to prevent performance issues
        int effectiveSize = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, effectiveSize);

        Page<Employee> employees = employeeService.getEmployeesForOrganization(organization, pageable);

        Page<EmployeeSummaryResponse> response = employees.map(this::mapToSummary);

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

            // Check for circular reporting structure
            if (employeeService.wouldCreateCycle(request.getReportsToEmployeeId(), employeeId)) {
                throw new RuntimeException("This assignment would create a circular reporting structure");
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

        if (request.getClientName() != null) {
            employeeService.updateClientName(employee, request.getClientName(), currentUser);
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

    /**
     * Assign roles to an employee (new role-based system)
     */
    @PutMapping("/{employeeId}/roles")
    public ResponseEntity<?> updateEmployeeRoles(@PathVariable UUID employeeId,
                                                 @Valid @RequestBody EmployeeRoleUpdateRequest request,
                                                 Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        // Check permission
        if (!permissionService.hasPermission(currentUser, "roles:assign:organization")) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        Employee employee = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getOrganization().getId().equals(organization.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        // Update user roles
        User user = employee.getUser();
        Set<Role> newRoles = new HashSet<>();
        for (Integer roleId : request.getRoleIds()) {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleId));

            // Validate role belongs to this org or is a system role
            if (!role.isSystemRole() &&
                (role.getOrganization() == null || !role.getOrganization().getId().equals(organization.getId()))) {
                return ResponseEntity.status(403).body(Map.of("error", "Cannot assign role from another organization"));
            }

            newRoles.add(role);
        }

        user.setRoles(newRoles);
        userService.save(user);

        return ResponseEntity.ok(Map.of("message", "Roles updated successfully"));
    }

    @DeleteMapping("/{employeeId}")
    public ResponseEntity<?> deactivateEmployee(@PathVariable UUID employeeId,
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
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        if (employee.isDeleted()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee is already deactivated"));
        }

        employee.setDeletedAt(java.time.LocalDateTime.now());
        employeeRepository.save(employee);

        return ResponseEntity.ok(Map.of("message", "Employee deactivated successfully"));
    }

    @PostMapping("/{employeeId}/reactivate")
    public ResponseEntity<?> reactivateEmployee(@PathVariable UUID employeeId,
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
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        if (!employee.isDeleted()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee is not deactivated"));
        }

        employee.setDeletedAt(null);
        employeeRepository.save(employee);

        return ResponseEntity.ok(Map.of("message", "Employee reactivated successfully"));
    }

    @PostMapping("/{employeeId}/reset-password")
    public ResponseEntity<?> adminResetPassword(@PathVariable UUID employeeId,
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
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        // Generate temporary password
        String temporaryPassword = java.util.UUID.randomUUID().toString().substring(0, 12);

        // Reset password
        User targetUser = employee.getUser();
        userService.setNewPassword(targetUser, temporaryPassword);
        targetUser.setMustChangePassword(true);
        userService.save(targetUser);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        response.put("temporaryPassword", temporaryPassword);

        return ResponseEntity.ok(response);
    }

    private EmployeeSummaryResponse mapToSummary(Employee employee) {
        return new EmployeeSummaryResponse(
                employee.getId(),
                employee.getUser().getId(),
                employee.getUser().getEmail(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getDepartment() != null ? employee.getDepartment().getName() : null,
                employee.getPosition() != null ? employee.getPosition().getName() : null,
                employee.getReportsTo() != null ? employee.getReportsTo().getId() : null,
                employee.getReportsTo() != null ? employee.getReportsTo().getUser().getEmail() : null,
                employee.getEmploymentType(),
                employee.getContractEndDate(),
                employee.getIsProbation(),
                employee.getProbationEndDate(),
                employee.getProbationStatus()
        );
    }

    @PostMapping("/{employeeId}/probation/extend")
    public ResponseEntity<Map<String, Object>> extendProbation(@PathVariable UUID employeeId,
                                                                @RequestBody ProbationManagementRequest request,
                                                                Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            return ResponseEntity.status(403).body(Map.of("error", "User has no organization"));
        }

        Employee employee = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getOrganization().getId().equals(organization.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        if (!employee.getIsProbation()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee is not on probation"));
        }

        if (request.getNewEndDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "New end date is required"));
        }

        employeeService.extendProbation(employee, request.getNewEndDate(), currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Probation period extended successfully");
        response.put("newEndDate", request.getNewEndDate());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{employeeId}/probation/complete")
    public ResponseEntity<Map<String, Object>> completeProbation(@PathVariable UUID employeeId,
                                                                  Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            return ResponseEntity.status(403).body(Map.of("error", "User has no organization"));
        }

        Employee employee = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getOrganization().getId().equals(organization.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        if (!employee.getIsProbation()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee is not on probation"));
        }

        employeeService.completeProbation(employee, currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Probation completed successfully");
        response.put("status", "completed");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{employeeId}/probation/terminate")
    public ResponseEntity<Map<String, Object>> terminateProbation(@PathVariable UUID employeeId,
                                                                   Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            return ResponseEntity.status(403).body(Map.of("error", "User has no organization"));
        }

        Employee employee = employeeService.getById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getOrganization().getId().equals(organization.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        if (!employee.getIsProbation()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employee is not on probation"));
        }

        employeeService.terminateProbation(employee, currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Probation terminated");
        response.put("status", "terminated");

        return ResponseEntity.ok(response);
    }

    private EmployeeDetailResponse mapToDetail(Employee employee) {
        return new EmployeeDetailResponse(
                employee.getId(),
                employee.getUser().getId(),
                employee.getUser().getEmail(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                employee.getDepartment() != null ? employee.getDepartment().getName() : null,
                employee.getPosition() != null ? employee.getPosition().getId() : null,
                employee.getPosition() != null ? employee.getPosition().getName() : null,
                employee.getReportsTo() != null ? employee.getReportsTo().getId() : null,
                employee.getReportsTo() != null ? employee.getReportsTo().getUser().getEmail() : null,
                employee.getEmploymentType(),
                employee.getClientId(),
                employee.getProjectId(),
                employee.getContractEndDate(),
                employee.getIsProbation(),
                employee.getProbationStartDate(),
                employee.getProbationEndDate(),
                employee.getProbationStatus()
        );
    }
}
