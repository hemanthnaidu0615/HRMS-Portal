package com.hrms.controller.recruitment;

import com.hrms.entity.recruitment.JobPosting;
import com.hrms.service.recruitment.JobPostingService;
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
@RequestMapping("/api/recruitment/job-posting")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class JobPostingController {

    private final JobPostingService service;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<JobPosting>> getAll(HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /recruitment/job-posting - organizationId: {}", organizationId);
        return ResponseEntity.ok(service.getAllByOrganization(organizationId));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<JobPosting>> getActive(HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /recruitment/job-posting/active - organizationId: {}", organizationId);
        return ResponseEntity.ok(service.getActiveByOrganization(organizationId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<JobPosting> getById(@PathVariable UUID id, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /recruitment/job-posting/{} - organizationId: {}", id, organizationId);
        return ResponseEntity.ok(service.getById(id, organizationId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<JobPosting> create(@Valid @RequestBody JobPosting entity, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("POST /recruitment/job-posting - organizationId: {}", organizationId);
        JobPosting created = service.create(entity, organizationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<JobPosting> update(@PathVariable UUID id, @Valid @RequestBody JobPosting entity, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("PUT /recruitment/job-posting/{} - organizationId: {}", id, organizationId);
        JobPosting updated = service.update(id, entity, organizationId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<Void> delete(@PathVariable UUID id, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("DELETE /recruitment/job-posting/{} - organizationId: {}", id, organizationId);
        service.delete(id, organizationId);
        return ResponseEntity.noContent().build();
    }
}
