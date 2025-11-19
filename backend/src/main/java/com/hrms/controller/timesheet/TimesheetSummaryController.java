package com.hrms.controller.timesheet;

import com.hrms.entity.timesheet.TimesheetSummary;
import com.hrms.service.timesheet.TimesheetSummaryService;
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
@RequestMapping("/api/timesheet/timesheet-summary")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TimesheetSummaryController {

    private final TimesheetSummaryService service;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<TimesheetSummary>> getAll(HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /timesheet/timesheet-summary - organizationId: {}", organizationId);
        return ResponseEntity.ok(service.getAllByOrganization(organizationId));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<TimesheetSummary>> getActive(HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /timesheet/timesheet-summary/active - organizationId: {}", organizationId);
        return ResponseEntity.ok(service.getActiveByOrganization(organizationId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<TimesheetSummary> getById(@PathVariable UUID id, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /timesheet/timesheet-summary/{} - organizationId: {}", id, organizationId);
        return ResponseEntity.ok(service.getById(id, organizationId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<TimesheetSummary> create(@Valid @RequestBody TimesheetSummary entity, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("POST /timesheet/timesheet-summary - organizationId: {}", organizationId);
        TimesheetSummary created = service.create(entity, organizationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<TimesheetSummary> update(@PathVariable UUID id, @Valid @RequestBody TimesheetSummary entity, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("PUT /timesheet/timesheet-summary/{} - organizationId: {}", id, organizationId);
        TimesheetSummary updated = service.update(id, entity, organizationId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<Void> delete(@PathVariable UUID id, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("DELETE /timesheet/timesheet-summary/{} - organizationId: {}", id, organizationId);
        service.delete(id, organizationId);
        return ResponseEntity.noContent().build();
    }
}
