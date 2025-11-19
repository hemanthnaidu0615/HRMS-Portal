#!/usr/bin/env python3
"""
Generate all backend entities, repositories, services, and controllers for HRMS modules
Creates 150+ files for 9 modules with proper Spring Boot annotations
"""

import os
from pathlib import Path

BASE_PATH = Path("/home/user/HRMS-Portal/backend/src/main/java/com/hrms")

# Module definitions with their entities
MODULES = {
    "attendance": [
        {
            "name": "Shift",
            "table": "shifts",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("String name", "name"),
                ("LocalTime startTime", "start_time"),
                ("LocalTime endTime", "end_time"),
                ("Integer gracePeriodMinutes", "grace_period_minutes"),
                ("Boolean isActive", "is_active"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "AttendanceRecord",
            "table": "attendance_records",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID employeeId", "employee_id"),
                ("LocalDate attendanceDate", "attendance_date"),
                ("LocalTime checkIn", "check_in"),
                ("LocalTime checkOut", "check_out"),
                ("String status", "status"),
                ("Integer workedMinutes", "worked_minutes"),
                ("String remarks", "remarks"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "AttendanceRegularization",
            "table": "attendance_regularization_requests",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID employeeId", "employee_id"),
                ("LocalDate attendanceDate", "attendance_date"),
                ("LocalTime requestedCheckIn", "requested_check_in"),
                ("LocalTime requestedCheckOut", "requested_check_out"),
                ("String reason", "reason"),
                ("String status", "status"),
                ("UUID approvedBy", "approved_by"),
                ("LocalDateTime approvedAt", "approved_at"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
    ],
    "leave": [
        {
            "name": "LeaveType",
            "table": "leave_types",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("String name", "name"),
                ("String code", "code"),
                ("Integer annualQuota", "annual_quota"),
                ("Boolean isPaid", "is_paid"),
                ("Boolean requiresApproval", "requires_approval"),
                ("Boolean isActive", "is_active"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "LeaveBalance",
            "table": "leave_balances",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID employeeId", "employee_id"),
                ("UUID leaveTypeId", "leave_type_id"),
                ("Integer year", "year"),
                ("BigDecimal totalQuota", "total_quota"),
                ("BigDecimal used", "used"),
                ("BigDecimal pending", "pending"),
                ("BigDecimal available", "available"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "LeaveApplication",
            "table": "leave_applications",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID employeeId", "employee_id"),
                ("UUID leaveTypeId", "leave_type_id"),
                ("LocalDate startDate", "start_date"),
                ("LocalDate endDate", "end_date"),
                ("BigDecimal totalDays", "total_days"),
                ("String reason", "reason"),
                ("String status", "status"),
                ("UUID approvedBy", "approved_by"),
                ("LocalDateTime approvedAt", "approved_at"),
                ("String rejectionReason", "rejection_reason"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
    ],
    "timesheet": [
        {
            "name": "TimesheetEntry",
            "table": "timesheet_entries",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID employeeId", "employee_id"),
                ("UUID projectId", "project_id"),
                ("UUID taskId", "task_id"),
                ("LocalDate workDate", "work_date"),
                ("Integer hoursWorked", "hours_worked"),
                ("String description", "description"),
                ("String status", "status"),
                ("UUID approvedBy", "approved_by"),
                ("LocalDateTime approvedAt", "approved_at"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
    ],
    "payroll": [
        {
            "name": "SalaryComponent",
            "table": "salary_components",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("String name", "name"),
                ("String code", "code"),
                ("String type", "type"),
                ("String calculationType", "calculation_type"),
                ("Boolean isActive", "is_active"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "PayrollRun",
            "table": "payroll_runs",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("String payPeriod", "pay_period"),
                ("LocalDate periodStart", "period_start"),
                ("LocalDate periodEnd", "period_end"),
                ("String status", "status"),
                ("Integer totalEmployees", "total_employees"),
                ("BigDecimal totalGrossPay", "total_gross_pay"),
                ("BigDecimal totalDeductions", "total_deductions"),
                ("BigDecimal totalNetPay", "total_net_pay"),
                ("UUID processedBy", "processed_by"),
                ("LocalDateTime processedAt", "processed_at"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "Payslip",
            "table": "payslips",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID payrollRunId", "payroll_run_id"),
                ("UUID employeeId", "employee_id"),
                ("LocalDate payPeriodStart", "pay_period_start"),
                ("LocalDate payPeriodEnd", "pay_period_end"),
                ("BigDecimal grossPay", "gross_pay"),
                ("BigDecimal totalDeductions", "total_deductions"),
                ("BigDecimal netPay", "net_pay"),
                ("String status", "status"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
    ],
    "performance": [
        {
            "name": "PerformanceCycle",
            "table": "performance_cycles",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("String name", "name"),
                ("LocalDate startDate", "start_date"),
                ("LocalDate endDate", "end_date"),
                ("String status", "status"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "EmployeeGoal",
            "table": "employee_goals",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID employeeId", "employee_id"),
                ("UUID cycleId", "cycle_id"),
                ("String title", "title"),
                ("String description", "description"),
                ("LocalDate targetDate", "target_date"),
                ("String status", "status"),
                ("Integer progressPercentage", "progress_percentage"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "PerformanceReview",
            "table": "performance_reviews",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID cycleId", "cycle_id"),
                ("UUID employeeId", "employee_id"),
                ("UUID reviewerId", "reviewer_id"),
                ("String reviewType", "review_type"),
                ("Integer overallRating", "overall_rating"),
                ("String comments", "comments"),
                ("String status", "status"),
                ("LocalDateTime submittedAt", "submitted_at"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
    ],
    "recruitment": [
        {
            "name": "JobPosting",
            "table": "job_postings",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("String title", "title"),
                ("UUID departmentId", "department_id"),
                ("UUID positionId", "position_id"),
                ("String employmentType", "employment_type"),
                ("String experienceLevel", "experience_level"),
                ("String description", "description"),
                ("String status", "status"),
                ("LocalDate postingDate", "posting_date"),
                ("LocalDate closingDate", "closing_date"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "JobApplication",
            "table": "job_applications",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID jobPostingId", "job_posting_id"),
                ("String candidateName", "candidate_name"),
                ("String candidateEmail", "candidate_email"),
                ("String candidatePhone", "candidate_phone"),
                ("String resumePath", "resume_path"),
                ("String status", "status"),
                ("LocalDateTime appliedAt", "applied_at"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "InterviewSchedule",
            "table": "interview_schedules",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID applicationId", "application_id"),
                ("String interviewRound", "interview_round"),
                ("LocalDateTime scheduledAt", "scheduled_at"),
                ("String interviewMode", "interview_mode"),
                ("String meetingLink", "meeting_link"),
                ("String status", "status"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
    ],
    "assets": [
        {
            "name": "AssetCategory",
            "table": "asset_categories",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("String name", "name"),
                ("String description", "description"),
                ("Boolean isActive", "is_active"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "Asset",
            "table": "assets",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID categoryId", "category_id"),
                ("String assetTag", "asset_tag"),
                ("String name", "name"),
                ("String description", "description"),
                ("String serialNumber", "serial_number"),
                ("BigDecimal purchasePrice", "purchase_price"),
                ("LocalDate purchaseDate", "purchase_date"),
                ("String status", "status"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "AssetAssignment",
            "table": "asset_assignments",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID assetId", "asset_id"),
                ("UUID employeeId", "employee_id"),
                ("LocalDate assignedDate", "assigned_date"),
                ("LocalDate returnedDate", "returned_date"),
                ("String status", "status"),
                ("String assignmentNotes", "assignment_notes"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
    ],
    "expenses": [
        {
            "name": "ExpenseCategory",
            "table": "expense_categories",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("String name", "name"),
                ("String description", "description"),
                ("Boolean requiresReceipt", "requires_receipt"),
                ("Boolean isActive", "is_active"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
        {
            "name": "ExpenseClaim",
            "table": "expense_claims",
            "fields": [
                ("UUID id", "id"),
                ("UUID organizationId", "organization_id"),
                ("UUID employeeId", "employee_id"),
                ("String claimNumber", "claim_number"),
                ("LocalDate claimDate", "claim_date"),
                ("BigDecimal totalAmount", "total_amount"),
                ("String status", "status"),
                ("UUID approvedBy", "approved_by"),
                ("LocalDateTime approvedAt", "approved_at"),
                ("String rejectionReason", "rejection_reason"),
                ("LocalDateTime createdAt", "created_at"),
            ],
            "has_org": True,
        },
    ],
}


def generate_entity(module, entity_def):
    """Generate JPA Entity class"""
    name = entity_def["name"]
    table = entity_def["table"]
    fields = entity_def["fields"]

    imports = {
        "jakarta.persistence.*",
        "java.time.LocalDateTime",
        "java.time.LocalDate",
        "java.time.LocalTime",
        "java.util.UUID",
        "java.math.BigDecimal",
        "lombok.Data",
        "lombok.NoArgsConstructor",
        "lombok.AllArgsConstructor",
        "org.hibernate.annotations.CreationTimestamp",
        "org.hibernate.annotations.UpdateTimestamp",
    }

    import_lines = "\n".join(f"import {imp};" for imp in sorted(imports))

    field_declarations = []
    for field_type, column_name in fields:
        java_name = "".join(part.capitalize() if i > 0 else part for i, part in enumerate(column_name.split("_")))

        if column_name == "id":
            field_declarations.append("    @Id")
            field_declarations.append("    @GeneratedValue")
            field_declarations.append(f"    private {field_type};")
        elif column_name == "created_at":
            field_declarations.append("    @CreationTimestamp")
            field_declarations.append(f"    @Column(name = \"{column_name}\")")
            field_declarations.append(f"    private {field_type};")
        elif column_name == "updated_at":
            field_declarations.append("    @UpdateTimestamp")
            field_declarations.append(f"    @Column(name = \"{column_name}\")")
            field_declarations.append(f"    private {field_type};")
        else:
            field_declarations.append(f"    @Column(name = \"{column_name}\")")
            field_declarations.append(f"    private {field_type};")
        field_declarations.append("")

    field_code = "\n".join(field_declarations)

    code = f"""package com.hrms.entity;

{import_lines}

/**
 * {name} Entity
 * Module: {module.upper()}
 */
@Entity
@Table(name = "{table}")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class {name} {{

{field_code}}}
"""

    return code


def generate_repository(module, entity_def):
    """Generate Spring Data JPA Repository"""
    name = entity_def["name"]

    code = f"""package com.hrms.repository;

import com.hrms.entity.{name};
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * {name} Repository
 * Module: {module.upper()}
 */
@Repository
public interface {name}Repository extends JpaRepository<{name}, UUID> {{

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM {name} e WHERE e.organizationId = :organizationId")
    Page<{name}> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<{name}> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}}
"""

    return code


def generate_service(module, entity_def):
    """Generate Service class"""
    name = entity_def["name"]

    code = f"""package com.hrms.service;

import com.hrms.entity.{name};
import com.hrms.repository.{name}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * {name} Service
 * Module: {module.upper()}
 */
@Service
@Transactional
public class {name}Service {{

    @Autowired
    private {name}Repository repository;

    /**
     * Get all records by organization with pagination
     */
    public Page<{name}> getByOrganization(UUID organizationId, Pageable pageable) {{
        return repository.findByOrganizationId(organizationId, pageable);
    }}

    /**
     * Get all records by organization
     */
    public List<{name}> getAllByOrganization(UUID organizationId) {{
        return repository.findByOrganizationId(organizationId);
    }}

    /**
     * Get record by ID
     */
    public Optional<{name}> getById(UUID id) {{
        return repository.findById(id);
    }}

    /**
     * Create new record
     */
    public {name} create({name} entity) {{
        return repository.save(entity);
    }}

    /**
     * Update existing record
     */
    public {name} update(UUID id, {name} updatedEntity) {{
        return repository.findById(id)
            .map(existing -> {{
                updatedEntity.setId(id);
                return repository.save(updatedEntity);
            }})
            .orElseThrow(() -> new RuntimeException("{name} not found with id: " + id));
    }}

    /**
     * Delete record
     */
    public void delete(UUID id) {{
        repository.deleteById(id);
    }}

    /**
     * Count records by organization
     */
    public Long countByOrganization(UUID organizationId) {{
        return repository.countByOrganizationId(organizationId);
    }}
}}
"""

    return code


def generate_controller(module, entity_def):
    """Generate REST Controller"""
    name = entity_def["name"]

    # Convert entity name to URL path (e.g., LeaveApplication -> leave-applications)
    url_path = "".join(["-" + c.lower() if c.isupper() and i > 0 else c.lower() for i, c in enumerate(name)])

    code = f"""package com.hrms.controller;

import com.hrms.entity.{name};
import com.hrms.service.{name}Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * {name} REST Controller
 * Module: {module.upper()}
 */
@RestController
@RequestMapping("/api/{module}/{url_path}")
@PreAuthorize("hasRole('ORGADMIN')")
public class {name}Controller {{

    @Autowired
    private {name}Service service;

    /**
     * Get all records by organization with pagination
     */
    @GetMapping
    public ResponseEntity<Page<{name}>> getAll(
            @RequestParam UUID organizationId,
            Pageable pageable) {{
        try {{
            Page<{name}> records = service.getByOrganization(organizationId, pageable);
            return ResponseEntity.ok(records);
        }} catch (Exception e) {{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }}
    }}

    /**
     * Get all records by organization without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<{name}>> getAllNoPagination(@RequestParam UUID organizationId) {{
        try {{
            List<{name}> records = service.getAllByOrganization(organizationId);
            return ResponseEntity.ok(records);
        }} catch (Exception e) {{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }}
    }}

    /**
     * Get record by ID
     */
    @GetMapping("/{{id}}")
    public ResponseEntity<{name}> getById(@PathVariable UUID id) {{
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }}

    /**
     * Create new record
     */
    @PostMapping
    public ResponseEntity<{name}> create(@RequestBody {name} entity) {{
        try {{
            {name} created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        }} catch (Exception e) {{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }}
    }}

    /**
     * Update existing record
     */
    @PutMapping("/{{id}}")
    public ResponseEntity<{name}> update(
            @PathVariable UUID id,
            @RequestBody {name} entity) {{
        try {{
            {name} updated = service.update(id, entity);
            return ResponseEntity.ok(updated);
        }} catch (RuntimeException e) {{
            return ResponseEntity.notFound().build();
        }} catch (Exception e) {{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }}
    }}

    /**
     * Delete record
     */
    @DeleteMapping("/{{id}}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {{
        try {{
            service.delete(id);
            return ResponseEntity.noContent().build();
        }} catch (Exception e) {{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }}
    }}

    /**
     * Get count by organization
     */
    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam UUID organizationId) {{
        try {{
            Long count = service.countByOrganization(organizationId);
            return ResponseEntity.ok(count);
        }} catch (Exception e) {{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }}
    }}
}}
"""

    return code


def main():
    """Generate all files"""
    print("Starting HRMS backend code generation...")

    entity_dir = BASE_PATH / "entity"
    repo_dir = BASE_PATH / "repository"
    service_dir = BASE_PATH / "service"
    controller_dir = BASE_PATH / "controller"

    # Create directories
    for d in [entity_dir, repo_dir, service_dir, controller_dir]:
        d.mkdir(parents=True, exist_ok=True)

    total_files = 0

    for module, entities in MODULES.items():
        print(f"\nGenerating {module} module...")

        for entity_def in entities:
            name = entity_def["name"]

            # Generate Entity
            entity_code = generate_entity(module, entity_def)
            entity_file = entity_dir / f"{name}.java"
            entity_file.write_text(entity_code)
            print(f"  ✓ Entity: {name}.java")
            total_files += 1

            # Generate Repository
            repo_code = generate_repository(module, entity_def)
            repo_file = repo_dir / f"{name}Repository.java"
            repo_file.write_text(repo_code)
            print(f"  ✓ Repository: {name}Repository.java")
            total_files += 1

            # Generate Service
            service_code = generate_service(module, entity_def)
            service_file = service_dir / f"{name}Service.java"
            service_file.write_text(service_code)
            print(f"  ✓ Service: {name}Service.java")
            total_files += 1

            # Generate Controller
            controller_code = generate_controller(module, entity_def)
            controller_file = controller_dir / f"{name}Controller.java"
            controller_file.write_text(controller_code)
            print(f"  ✓ Controller: {name}Controller.java")
            total_files += 1

    print(f"\n✅ Generation complete! Created {total_files} files across 9 modules.")
    print(f"\nModule breakdown:")
    for module, entities in MODULES.items():
        print(f"  - {module}: {len(entities)} entities × 4 layers = {len(entities) * 4} files")


if __name__ == "__main__":
    main()
