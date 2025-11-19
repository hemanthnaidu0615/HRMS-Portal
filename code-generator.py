#!/usr/bin/env python3
"""
HRMS Complete Code Generator
Generates all entities, repositories, services, and controllers for the HRMS platform
"""

import os
import re
from pathlib import Path

BACKEND_BASE = "/home/user/HRMS-Portal/backend/src/main/java/com/hrms"

# Define all modules with their entities
MODULES = {
    "attendance": [
        "Shift", "EmployeeShift", "AttendanceRecord", "AttendanceRegularizationRequest",
        "BiometricDevice", "BiometricLog", "AttendanceSummary"
    ],
    "leave": [
        "LeaveType", "LeaveBalance", "LeaveApplication", "LeaveTransaction",
        "Holiday", "EmployeeHolidaySelection", "LeaveEncashmentRequest",
        "CompensatoryOffCredit"
    ],
    "timesheet": [
        "ProjectTask", "TimesheetEntry", "TimesheetSummary"
    ],
    "payroll": [
        "SalaryComponent", "EmployeeSalaryStructure", "EmployeeSalaryComponent",
        "TaxSlab", "PayrollRun", "Payslip", "PayslipLineItem"
    ],
    "performance": [
        "PerformanceCycle", "EmployeeGoal", "PerformanceReview", "CalibrationSession"
    ],
    "recruitment": [
        "JobPosting", "JobApplication", "InterviewSchedule", "InterviewFeedback", "JobOffer"
    ],
    "asset": [
        "AssetCategory", "Asset", "AssetAssignment", "AssetMaintenance"
    ],
    "expense": [
        "ExpenseCategory", "ExpenseClaim", "ExpenseClaimItem"
    ],
    "notification": [
        "NotificationTemplate", "Notification", "NotificationPreference",
        "EscalationRule", "Reminder"
    ]
}

def to_snake_case(name):
    """Convert CamelCase to snake_case"""
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def to_table_name(entity_name):
    """Convert entity name to table name"""
    snake = to_snake_case(entity_name)
    # Handle pluralization
    if snake.endswith('y'):
        return snake[:-1] + 'ies'
    elif snake.endswith('s'):
        return snake + 'es'
    else:
        return snake + 's'

def generate_entity(module, entity_name):
    """Generate JPA entity class"""
    table_name = to_table_name(entity_name)
    package = f"com.hrms.entity.{module}"

    content = f"""package {package};

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.*;
import java.math.BigDecimal;
import java.util.UUID;

import com.hrms.entity.*;

@Entity
@Table(name = "{table_name}")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class {entity_name} {{

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {{
        createdAt = LocalDateTime.now();
        if (isActive == null) {{
            isActive = true;
        }}
    }}

    @PreUpdate
    protected void onUpdate() {{
        updatedAt = LocalDateTime.now();
    }}

    // TODO: Add specific fields for {entity_name} based on schema
}}
"""
    return content

def generate_repository(module, entity_name):
    """Generate Spring Data JPA repository"""
    package = f"com.hrms.repository.{module}"
    entity_package = f"com.hrms.entity.{module}"

    content = f"""package {package};

import {entity_package}.{entity_name};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface {entity_name}Repository extends JpaRepository<{entity_name}, UUID> {{

    List<{entity_name}> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<{entity_name}> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<{entity_name}> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM {entity_name} e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<{entity_name}> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}}
"""
    return content

def generate_service(module, entity_name):
    """Generate service class with basic CRUD"""
    package = f"com.hrms.service.{module}"
    entity_package = f"com.hrms.entity.{module}"
    repo_package = f"com.hrms.repository.{module}"

    content = f"""package {package};

import {entity_package}.{entity_name};
import {repo_package}.{entity_name}Repository;
import com.hrms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class {entity_name}Service {{

    private final {entity_name}Repository repository;

    public List<{entity_name}> getAllByOrganization(UUID organizationId) {{
        log.debug("Fetching all {entity_name} for organization: {{}}", organizationId);
        return repository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }}

    public List<{entity_name}> getActiveByOrganization(UUID organizationId) {{
        log.debug("Fetching active {entity_name} for organization: {{}}", organizationId);
        return repository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);
    }}

    public {entity_name} getById(UUID id, UUID organizationId) {{
        log.debug("Fetching {entity_name} with id: {{}} for organization: {{}}", id, organizationId);
        return repository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("{entity_name} not found with id: " + id));
    }}

    public {entity_name} create({entity_name} entity, UUID organizationId) {{
        log.debug("Creating new {entity_name} for organization: {{}}", organizationId);
        // Organization will be set by the controller
        return repository.save(entity);
    }}

    public {entity_name} update(UUID id, {entity_name} entity, UUID organizationId) {{
        log.debug("Updating {entity_name} with id: {{}} for organization: {{}}", id, organizationId);
        {entity_name} existing = getById(id, organizationId);
        // Update fields as needed
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }}

    public void delete(UUID id, UUID organizationId) {{
        log.debug("Soft deleting {entity_name} with id: {{}} for organization: {{}}", id, organizationId);
        {entity_name} entity = getById(id, organizationId);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setIsActive(false);
        repository.save(entity);
    }}

    public void hardDelete(UUID id, UUID organizationId) {{
        log.debug("Hard deleting {entity_name} with id: {{}} for organization: {{}}", id, organizationId);
        {entity_name} entity = getById(id, organizationId);
        repository.delete(entity);
    }}
}}
"""
    return content

def generate_controller(module, entity_name):
    """Generate REST controller"""
    package = f"com.hrms.controller.{module}"
    entity_package = f"com.hrms.entity.{module}"
    service_package = f"com.hrms.service.{module}"

    content = f"""package {package};

import {entity_package}.{entity_name};
import {service_package}.{entity_name}Service;
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
@RequestMapping("/api/{module}/{to_snake_case(entity_name).replace('_', '-')}")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class {entity_name}Controller {{

    private final {entity_name}Service service;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<{entity_name}>> getAll(HttpServletRequest request) {{
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /{module}/{to_snake_case(entity_name).replace('_', '-')} - organizationId: {{}}", organizationId);
        return ResponseEntity.ok(service.getAllByOrganization(organizationId));
    }}

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<List<{entity_name}>> getActive(HttpServletRequest request) {{
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /{module}/{to_snake_case(entity_name).replace('_', '-')}/active - organizationId: {{}}", organizationId);
        return ResponseEntity.ok(service.getActiveByOrganization(organizationId));
    }}

    @GetMapping("/{{id}}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<{entity_name}> getById(@PathVariable UUID id, HttpServletRequest request) {{
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("GET /{module}/{to_snake_case(entity_name).replace('_', '-')}/{{}} - organizationId: {{}}", id, organizationId);
        return ResponseEntity.ok(service.getById(id, organizationId));
    }}

    @PostMapping
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<{entity_name}> create(@Valid @RequestBody {entity_name} entity, HttpServletRequest request) {{
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("POST /{module}/{to_snake_case(entity_name).replace('_', '-')} - organizationId: {{}}", organizationId);
        {entity_name} created = service.create(entity, organizationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }}

    @PutMapping("/{{id}}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<{entity_name}> update(@PathVariable UUID id, @Valid @RequestBody {entity_name} entity, HttpServletRequest request) {{
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("PUT /{module}/{to_snake_case(entity_name).replace('_', '-')}/{{}} - organizationId: {{}}", id, organizationId);
        {entity_name} updated = service.update(id, entity, organizationId);
        return ResponseEntity.ok(updated);
    }}

    @DeleteMapping("/{{id}}")
    @PreAuthorize("hasAnyAuthority('orgadmin', 'superadmin')")
    public ResponseEntity<Void> delete(@PathVariable UUID id, HttpServletRequest request) {{
        UUID organizationId = jwtAuthenticationFilter.getOrganizationId(request);
        log.debug("DELETE /{module}/{to_snake_case(entity_name).replace('_', '-')}/{{}} - organizationId: {{}}", id, organizationId);
        service.delete(id, organizationId);
        return ResponseEntity.noContent().build();
    }}
}}
"""
    return content

def main():
    print("🎯 Generating HRMS Backend Code...")
    print("=" * 60)

    total_files = 0

    for module, entities in MODULES.items():
        print(f"\n📦 Module: {module.upper()}")
        print(f"   Entities: {len(entities)}")

        for entity_name in entities:
            # Generate entity
            entity_content = generate_entity(module, entity_name)
            entity_path = f"{BACKEND_BASE}/entity/{module}/{entity_name}.java"
            Path(entity_path).write_text(entity_content)

            # Generate repository
            repo_content = generate_repository(module, entity_name)
            repo_path = f"{BACKEND_BASE}/repository/{module}/{entity_name}Repository.java"
            Path(repo_path).write_text(repo_content)

            # Generate service
            service_content = generate_service(module, entity_name)
            service_path = f"{BACKEND_BASE}/service/{module}/{entity_name}Service.java"
            Path(service_path).write_text(service_content)

            # Generate controller
            controller_content = generate_controller(module, entity_name)
            controller_path = f"{BACKEND_BASE}/controller/{module}/{entity_name}Controller.java"
            Path(controller_path).write_text(controller_content)

            total_files += 4
            print(f"   ✅ {entity_name}: Entity, Repository, Service, Controller")

    print(f"\n🎉 Code Generation Complete!")
    print(f"📊 Total files generated: {total_files}")
    print(f"   - {len([e for entities in MODULES.values() for e in entities])} Entities")
    print(f"   - {len([e for entities in MODULES.values() for e in entities])} Repositories")
    print(f"   - {len([e for entities in MODULES.values() for e in entities])} Services")
    print(f"   - {len([e for entities in MODULES.values() for e in entities])} Controllers")

if __name__ == "__main__":
    main()
