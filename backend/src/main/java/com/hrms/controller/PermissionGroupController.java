package com.hrms.controller;

import com.hrms.dto.PermissionGroupResponse;
import com.hrms.dto.PermissionResponse;
import com.hrms.entity.PermissionGroup;
import com.hrms.repository.PermissionGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orgadmin/permissions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ORGADMIN')")
public class PermissionGroupController {

    private final PermissionGroupRepository permissionGroupRepository;

    @GetMapping("/groups")
    public ResponseEntity<List<PermissionGroupResponse>> getAllPermissionGroups() {
        List<PermissionGroupResponse> groups = permissionGroupRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(groups);
    }

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<PermissionGroupResponse> getPermissionGroup(@PathVariable UUID groupId) {
        PermissionGroup group = permissionGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Permission group not found"));

        return ResponseEntity.ok(toResponse(group));
    }

    private PermissionGroupResponse toResponse(PermissionGroup group) {
        List<PermissionResponse> permissions = group.getPermissions().stream()
                .map(p -> new PermissionResponse(p.getId(), p.getCode(), p.getDescription()))
                .collect(Collectors.toList());

        return new PermissionGroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                permissions
        );
    }
}
