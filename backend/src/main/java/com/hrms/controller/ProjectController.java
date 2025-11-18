package com.hrms.controller;

import com.hrms.dto.project.*;
import com.hrms.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<List<ProjectListResponse>> getAllProjects(
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) Boolean activeOnly,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<ProjectListResponse> projects = projectService.getAllProjects(email, clientId, activeOnly);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<ProjectDetailResponse> getProjectById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        ProjectDetailResponse project = projectService.getProjectById(id, email);
        return ResponseEntity.ok(project);
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<ProjectDetailResponse> createProject(
            @RequestBody CreateProjectRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        ProjectDetailResponse project = projectService.createProject(request, email);
        return ResponseEntity.ok(project);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<ProjectDetailResponse> updateProject(
            @PathVariable UUID id,
            @RequestBody UpdateProjectRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        ProjectDetailResponse project = projectService.updateProject(id, request, email);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        projectService.deleteProject(id, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/codes/next")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<String> getNextProjectCode(
            @RequestParam UUID clientId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        String nextCode = projectService.generateNextProjectCode(clientId, email);
        return ResponseEntity.ok(nextCode);
    }
}
