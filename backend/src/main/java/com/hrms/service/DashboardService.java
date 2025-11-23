package com.hrms.service;

import com.hrms.dto.DashboardStatsResponse;
import com.hrms.dto.DashboardStatsResponse.*;
import com.hrms.entity.AuditLog;
import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for computing dashboard statistics
 */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final OrganizationRepository organizationRepository;

    public DashboardService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           UserRepository userRepository,
                           AuditLogRepository auditLogRepository,
                           OrganizationRepository organizationRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.organizationRepository = organizationRepository;
    }

    /**
     * Get dashboard stats for an organization
     */
    public DashboardStatsResponse getOrganizationDashboardStats(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + organizationId));

        DashboardStatsResponse response = new DashboardStatsResponse();

        // Get all employees for the organization
        List<Employee> employees = employeeRepository.findByOrganizationAndDeletedAtIsNull(organization);

        // Key Metrics
        response.setTotalEmployees(employees.size());
        response.setActiveEmployees(employees.stream()
                .filter(e -> "active".equalsIgnoreCase(e.getEmploymentStatus()))
                .count());
        response.setOnProbation(employees.stream()
                .filter(e -> "probation".equalsIgnoreCase(e.getEmploymentStatus()))
                .count());
        response.setOnLeave(employees.stream()
                .filter(e -> "on_leave".equalsIgnoreCase(e.getEmploymentStatus()))
                .count());

        // New hires this month
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        response.setNewHiresThisMonth(employees.stream()
                .filter(e -> e.getHireDate() != null && !e.getHireDate().isBefore(startOfMonth))
                .count());

        // Attendance rate (placeholder - would need attendance tracking)
        double activeRate = employees.isEmpty() ? 0 :
                ((double) response.getActiveEmployees() / response.getTotalEmployees()) * 100;
        response.setAttendanceRate(Math.round(activeRate * 10.0) / 10.0);

        // Department stats
        Map<String, Long> deptCounts = employees.stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getDepartment().getName(),
                        Collectors.counting()
                ));

        List<DepartmentStat> deptStats = deptCounts.entrySet().stream()
                .map(entry -> new DepartmentStat(entry.getKey(), entry.getValue(), 0.0))
                .sorted((a, b) -> Long.compare(b.getEmployees(), a.getEmployees()))
                .limit(10)
                .collect(Collectors.toList());
        response.setDepartmentStats(deptStats);

        // Employment type stats
        Map<String, Long> typeCounts = employees.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getEmploymentType() != null ? e.getEmploymentType() : "Not Set",
                        Collectors.counting()
                ));

        List<EmploymentTypeStat> typeStats = typeCounts.entrySet().stream()
                .map(entry -> new EmploymentTypeStat(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());
        response.setEmploymentTypeStats(typeStats);

        // Recent activities from audit logs
        List<ActivityItem> activities = getRecentActivities(organization);
        response.setRecentActivities(activities);

        // Pending approvals (placeholder)
        response.setPendingApprovals(0);

        return response;
    }

    /**
     * Get recent activities from audit logs
     */
    private List<ActivityItem> getRecentActivities(Organization organization) {
        try {
            var page = auditLogRepository.findByOrganizationOrderByPerformedAtDesc(
                    organization, PageRequest.of(0, 10));

            return page.getContent().stream()
                    .map(this::convertToActivityItem)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // If audit logs aren't set up, return empty list
            return Collections.emptyList();
        }
    }

    private ActivityItem convertToActivityItem(AuditLog log) {
        String timeAgo = formatTimeAgo(log.getPerformedAt());
        String userName = "System";
        if (log.getPerformedBy() != null) {
            userRepository.findById(log.getPerformedBy().getId())
                    .ifPresent(user -> {
                        // Try to get employee name
                        employeeRepository.findByUser(user)
                                .ifPresent(emp -> {});
                    });
        }

        return new ActivityItem(
                log.getEntityType() != null ? log.getEntityType().toLowerCase() : "system",
                userName,
                formatAction(log.getActionType(), log.getEntityType()),
                timeAgo,
                "completed"
        );
    }

    private String formatAction(String actionType, String entityType) {
        if (actionType == null) return "performed an action";

        String action = actionType.toLowerCase().replace("_", " ");
        if (entityType != null) {
            action += " " + entityType.toLowerCase();
        }
        return action;
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "recently";

        long minutes = ChronoUnit.MINUTES.between(dateTime, LocalDateTime.now());
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + " min ago";

        long hours = ChronoUnit.HOURS.between(dateTime, LocalDateTime.now());
        if (hours < 24) return hours + " hour" + (hours > 1 ? "s" : "") + " ago";

        long days = ChronoUnit.DAYS.between(dateTime, LocalDateTime.now());
        if (days < 7) return days + " day" + (days > 1 ? "s" : "") + " ago";

        return dateTime.format(DateTimeFormatter.ofPattern("MMM d"));
    }
}
