package com.hrms.controller.payroll;

import com.hrms.entity.payroll.PayslipLineItem;
import com.hrms.service.payroll.PayslipLineItemService;
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
@RequestMapping("/api/payroll/payslip-line-item")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PayslipLineItemController {

    private final PayslipLineItemService service;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<PayslipLineItem>> getAll(HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /payroll/payslip-line-item - organizationId: {}", organizationId);
        return ResponseEntity.ok(service.getAllByOrganization(organizationId));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<PayslipLineItem>> getActive(HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /payroll/payslip-line-item/active - organizationId: {}", organizationId);
        return ResponseEntity.ok(service.getActiveByOrganization(organizationId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<PayslipLineItem> getById(@PathVariable UUID id, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /payroll/payslip-line-item/{} - organizationId: {}", id, organizationId);
        return ResponseEntity.ok(service.getById(id, organizationId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<PayslipLineItem> create(@Valid @RequestBody PayslipLineItem entity, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("POST /payroll/payslip-line-item - organizationId: {}", organizationId);
        PayslipLineItem created = service.create(entity, organizationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<PayslipLineItem> update(@PathVariable UUID id, @Valid @RequestBody PayslipLineItem entity, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("PUT /payroll/payslip-line-item/{} - organizationId: {}", id, organizationId);
        PayslipLineItem updated = service.update(id, entity, organizationId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<Void> delete(@PathVariable UUID id, HttpServletRequest request) {
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("DELETE /payroll/payslip-line-item/{} - organizationId: {}", id, organizationId);
        service.delete(id, organizationId);
        return ResponseEntity.noContent().build();
    }
}
