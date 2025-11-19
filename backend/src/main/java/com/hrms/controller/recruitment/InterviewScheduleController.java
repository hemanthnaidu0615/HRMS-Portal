package com.hrms.controller.recruitment;

import com.hrms.entity.recruitment.InterviewSchedule;
import com.hrms.service.recruitment.InterviewScheduleService;
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
@RequestMapping("/api/recruitment/interview-schedule")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InterviewScheduleController {

    private final InterviewScheduleService service;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<InterviewSchedule>> getAll(HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /recruitment/interview-schedule - organizationId: {}", organizationId);
        return ResponseEntity.ok(service.getAllByOrganization(organizationId));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<InterviewSchedule>> getActive(HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /recruitment/interview-schedule/active - organizationId: {}", organizationId);
        return ResponseEntity.ok(service.getActiveByOrganization(organizationId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<InterviewSchedule> getById(@PathVariable UUID id, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /recruitment/interview-schedule/{} - organizationId: {}", id, organizationId);
        return ResponseEntity.ok(service.getById(id, organizationId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<InterviewSchedule> create(@Valid @RequestBody InterviewSchedule entity, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("POST /recruitment/interview-schedule - organizationId: {}", organizationId);
        InterviewSchedule created = service.create(entity, organizationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<InterviewSchedule> update(@PathVariable UUID id, @Valid @RequestBody InterviewSchedule entity, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("PUT /recruitment/interview-schedule/{} - organizationId: {}", id, organizationId);
        InterviewSchedule updated = service.update(id, entity, organizationId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<Void> delete(@PathVariable UUID id, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("DELETE /recruitment/interview-schedule/{} - organizationId: {}", id, organizationId);
        service.delete(id, organizationId);
        return ResponseEntity.noContent().build();
    }
}
