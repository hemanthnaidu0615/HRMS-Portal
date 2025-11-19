package com.hrms.controller.recruitment;

import com.hrms.entity.recruitment.JobApplication;
import com.hrms.service.recruitment.JobApplicationService;
import com.hrms.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruitment/job-application")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class JobApplicationController {

    private final JobApplicationService service;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<JobApplication>> getAll(HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /recruitment/job-application - organizationId: {}", organizationId);
        return ResponseEntity.ok(service.getAllByOrganization(organizationId));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<JobApplication>> getActive(HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /recruitment/job-application/active - organizationId: {}", organizationId);
        return ResponseEntity.ok(service.getActiveByOrganization(organizationId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<JobApplication> getById(@PathVariable UUID id, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /recruitment/job-application/{} - organizationId: {}", id, organizationId);
        return ResponseEntity.ok(service.getById(id, organizationId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<JobApplication> create(@Valid @RequestBody JobApplication entity, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("POST /recruitment/job-application - organizationId: {}", organizationId);
        JobApplication created = service.create(entity, organizationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<JobApplication> update(@PathVariable UUID id, @Valid @RequestBody JobApplication entity, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("PUT /recruitment/job-application/{} - organizationId: {}", id, organizationId);
        JobApplication updated = service.update(id, entity, organizationId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<Void> delete(@PathVariable UUID id, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("DELETE /recruitment/job-application/{} - organizationId: {}", id, organizationId);
        service.delete(id, organizationId);
        return ResponseEntity.noContent().build();
    }
}
