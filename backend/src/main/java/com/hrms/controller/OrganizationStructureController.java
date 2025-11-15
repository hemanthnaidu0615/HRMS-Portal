package com.hrms.controller;

import com.hrms.dto.DepartmentRequest;
import com.hrms.dto.DepartmentResponse;
import com.hrms.dto.PositionRequest;
import com.hrms.dto.PositionResponse;
import com.hrms.entity.Department;
import com.hrms.entity.Organization;
import com.hrms.entity.Position;
import com.hrms.entity.User;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.PositionRepository;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orgadmin/structure")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ORGADMIN','SUPERADMIN')")
public class OrganizationStructureController {

    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final UserService userService;

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentResponse>> getDepartments(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        List<DepartmentResponse> departments = departmentRepository.findByOrganization(organization)
                .stream()
                .map(dept -> new DepartmentResponse(dept.getId(), dept.getName()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(departments);
    }

    @PostMapping("/departments")
    public ResponseEntity<DepartmentResponse> createDepartment(@Valid @RequestBody DepartmentRequest request,
                                                               Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        Department department = new Department(organization, request.getName());
        Department saved = departmentRepository.save(department);

        return ResponseEntity.ok(new DepartmentResponse(saved.getId(), saved.getName()));
    }

    @GetMapping("/positions")
    public ResponseEntity<List<PositionResponse>> getPositions(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        List<PositionResponse> positions = positionRepository.findByOrganization(organization)
                .stream()
                .map(pos -> new PositionResponse(pos.getId(), pos.getName(), pos.getSeniorityLevel()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(positions);
    }

    @PostMapping("/positions")
    public ResponseEntity<PositionResponse> createPosition(@Valid @RequestBody PositionRequest request,
                                                           Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization organization = currentUser.getOrganization();
        if (organization == null) {
            throw new RuntimeException("User has no organization");
        }

        Position position = new Position(organization, request.getName(), request.getSeniorityLevel());
        Position saved = positionRepository.save(position);

        return ResponseEntity.ok(new PositionResponse(saved.getId(), saved.getName(), saved.getSeniorityLevel()));
    }
}
