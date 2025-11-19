package com.hrms.service;

import com.hrms.entity.Employee;
import com.hrms.repository.*;
import com.hrms.repository.attendance.AttendanceRecordRepository;
import com.hrms.repository.leave.LeaveApplicationRepository;
import com.hrms.repository.timesheet.TimesheetEntryRepository;
import com.hrms.repository.asset.AssetAssignmentRepository;
import com.hrms.repository.performance.PerformanceReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Scheduled Task Service
 * Manages all scheduled/cron jobs for the HRMS system
 * Runs various background tasks like reminders, notifications, cleanup, etc.
 */
@Service
public class ScheduledTaskService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JobLogService jobLogService;

    @Autowired
    private TimesheetEntryRepository timesheetRepository;

    @Autowired
    private LeaveApplicationRepository leaveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRepository;

    @Autowired
    private AssetAssignmentRepository assetAssignmentRepository;

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    /**
     * Daily timesheet reminders at 5 PM (Mon-Fri)
     * Reminds employees who haven't submitted timesheet for current week
     */
    @Scheduled(cron = "0 0 17 * * MON-FRI")
    @Transactional
    public void sendTimesheetReminders() {
        String jobName = "TimesheetReminders";
        long startTime = System.currentTimeMillis();
        logger.info("Starting daily timesheet reminder job");

        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);

            // Find all active employees
            List<Employee> employees = employeeRepository.findByEmploymentStatusAndDeletedAtIsNull("active");

            for (Employee employee : employees) {
                // Check if employee has submitted timesheet for this week
                long timesheetCount = timesheetRepository.countByEmployeeIdAndDateBetween(
                    employee.getId(),
                    startOfWeek,
                    today
                );

                // If no timesheet entries, send reminder
                if (timesheetCount == 0) {
                    notificationService.createNotification(
                        employee,
                        "REMINDER",
                        "Timesheet Reminder",
                        "Please submit your timesheet for this week.",
                        null
                    );
                }
            }

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed timesheet reminder job in {}ms", duration);
            jobLogService.logSuccess(jobName, duration);

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            logger.error("Error in timesheet reminder job", e);
            jobLogService.logFailure(jobName, duration, e.getMessage());
        }
    }

    /**
     * Weekly leave balance notifications (every Monday 9 AM)
     * Notifies employees with low leave balance
     */
    @Scheduled(cron = "0 0 9 * * MON")
    @Transactional
    public void sendLeaveBalanceReminders() {
        long startTime = System.currentTimeMillis();
        logger.info("Starting weekly leave balance reminder job");

        try {
            // Find employees with low leave balance (< 5 days)
            List<Employee> employees = employeeRepository.findByEmploymentStatusAndDeletedAtIsNull("active");

            for (Employee employee : employees) {
                // This is a placeholder - you would implement leave balance logic
                // based on your LeaveBalance entity
                notificationService.createNotification(
                    employee,
                    "INFO",
                    "Leave Balance Update",
                    "Your weekly leave balance summary is ready.",
                    null
                );
            }

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed leave balance reminder job in {}ms", duration);

        } catch (Exception e) {
            logger.error("Error in leave balance reminder job", e);
        }
    }

    /**
     * Monthly payroll reminder (25th of every month at 10 AM)
     * Notifies HR/Finance to process payroll
     */
    @Scheduled(cron = "0 0 10 25 * *")
    @Transactional
    public void sendPayrollProcessingReminder() {
        long startTime = System.currentTimeMillis();
        logger.info("Starting monthly payroll processing reminder job");

        try {
            // Find HR/Finance admins
            List<Employee> hrAdmins = employeeRepository.findByRoleName("ORGADMIN");

            for (Employee admin : hrAdmins) {
                notificationService.createNotification(
                    admin,
                    "REMINDER",
                    "Payroll Processing Reminder",
                    "Monthly payroll processing is due. Please review and process employee salaries.",
                    null
                );
            }

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed payroll processing reminder job in {}ms", duration);

        } catch (Exception e) {
            logger.error("Error in payroll processing reminder job", e);
        }
    }

    /**
     * Probation period completion reminder (daily at 8 AM)
     * Finds employees completing probation in next 7 days
     * Notifies managers for performance review
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void checkProbationCompletions() {
        long startTime = System.currentTimeMillis();
        logger.info("Starting probation completion check job");

        try {
            LocalDate today = LocalDate.now();
            LocalDate nextWeek = today.plusDays(7);

            // Find employees whose probation ends in next 7 days
            List<Employee> employees = employeeRepository.findByEmploymentStatusAndDeletedAtIsNull("active");

            for (Employee employee : employees) {
                if (employee.getProbationEndDate() != null) {
                    LocalDate probationEnd = employee.getProbationEndDate();

                    if (!probationEnd.isBefore(today) && !probationEnd.isAfter(nextWeek)) {
                        // Notify employee
                        notificationService.createNotification(
                            employee,
                            "INFO",
                            "Probation Period Ending",
                            "Your probation period ends on " + probationEnd + ". Your manager will conduct a performance review.",
                            null
                        );

                        // Notify manager if exists
                        if (employee.getReportsTo() != null) {
                            notificationService.createNotification(
                                employee.getReportsTo(),
                                "REMINDER",
                                "Employee Probation Review Due",
                                employee.getFirstName() + " " + employee.getLastName() + "'s probation ends on " + probationEnd + ". Please conduct performance review.",
                                null
                            );
                        }
                    }
                }
            }

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed probation completion check job in {}ms", duration);

        } catch (Exception e) {
            logger.error("Error in probation completion check job", e);
        }
    }

    /**
     * Asset return reminders (daily at 10 AM)
     * Finds overdue asset returns and sends reminders
     */
    @Scheduled(cron = "0 0 10 * * *")
    @Transactional
    public void sendAssetReturnReminders() {
        long startTime = System.currentTimeMillis();
        logger.info("Starting asset return reminder job");

        try {
            LocalDate today = LocalDate.now();

            // This is a placeholder - implement based on your AssetAssignment entity
            // Find assignments with expected return date in the past and not yet returned
            logger.info("Checking for overdue asset returns");

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed asset return reminder job in {}ms", duration);

        } catch (Exception e) {
            logger.error("Error in asset return reminder job", e);
        }
    }

    /**
     * Performance review cycle reminders (daily at 9 AM)
     * Checks active review cycles and sends reminders for pending reviews
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void sendPerformanceReviewReminders() {
        long startTime = System.currentTimeMillis();
        logger.info("Starting performance review reminder job");

        try {
            LocalDate today = LocalDate.now();

            // This is a placeholder - implement based on your ReviewCycle entity
            // Find active review cycles and pending reviews
            logger.info("Checking for pending performance reviews");

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed performance review reminder job in {}ms", duration);

        } catch (Exception e) {
            logger.error("Error in performance review reminder job", e);
        }
    }

    /**
     * Cleanup old notifications (weekly on Sunday 2 AM)
     * Deletes notifications older than 90 days
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    @Transactional
    public void cleanupOldNotifications() {
        String jobName = "NotificationCleanup";
        long startTime = System.currentTimeMillis();
        logger.info("Starting notification cleanup job");

        try {
            int daysToKeep = 90;
            notificationService.deleteOldNotifications(daysToKeep);

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed notification cleanup job in {}ms", duration);
            jobLogService.logSuccess(jobName, duration);

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            logger.error("Error in notification cleanup job", e);
            jobLogService.logFailure(jobName, duration, e.getMessage());
        }
    }

    /**
     * Leave expiry reminders (1st of every month at 9 AM)
     * Finds leaves expiring at end of year and sends reminders
     */
    @Scheduled(cron = "0 0 9 1 * *")
    @Transactional
    public void sendLeaveExpiryReminders() {
        long startTime = System.currentTimeMillis();
        logger.info("Starting leave expiry reminder job");

        try {
            LocalDate today = LocalDate.now();
            LocalDate endOfYear = LocalDate.of(today.getYear(), 12, 31);

            // Calculate months until end of year
            long monthsUntilExpiry = ChronoUnit.MONTHS.between(today, endOfYear);

            if (monthsUntilExpiry <= 3) {
                // Send reminders if less than 3 months until year end
                List<Employee> employees = employeeRepository.findByEmploymentStatusAndDeletedAtIsNull("active");

                for (Employee employee : employees) {
                    notificationService.createNotification(
                        employee,
                        "REMINDER",
                        "Leave Expiry Reminder",
                        "Your unused leaves will expire on " + endOfYear + ". Please plan to use them before the year ends.",
                        null
                    );
                }
            }

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed leave expiry reminder job in {}ms", duration);

        } catch (Exception e) {
            logger.error("Error in leave expiry reminder job", e);
        }
    }

    /**
     * Daily attendance summary (daily at 6 PM)
     * Sends daily attendance summary to managers
     */
    @Scheduled(cron = "0 0 18 * * MON-FRI")
    @Transactional
    public void sendDailyAttendanceSummary() {
        long startTime = System.currentTimeMillis();
        logger.info("Starting daily attendance summary job");

        try {
            LocalDate today = LocalDate.now();

            // Find all managers
            List<Employee> managers = employeeRepository.findManagers();

            for (Employee manager : managers) {
                // This is a placeholder - implement attendance summary logic
                notificationService.createNotification(
                    manager,
                    "INFO",
                    "Daily Attendance Summary",
                    "Your team's attendance summary for " + today + " is ready.",
                    null
                );
            }

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed daily attendance summary job in {}ms", duration);

        } catch (Exception e) {
            logger.error("Error in daily attendance summary job", e);
        }
    }

    /**
     * Birthday reminders (daily at 7 AM)
     * Sends birthday wishes and notifications
     */
    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void sendBirthdayReminders() {
        long startTime = System.currentTimeMillis();
        logger.info("Starting birthday reminder job");

        try {
            LocalDate today = LocalDate.now();

            // Find employees with birthday today
            List<Employee> employees = employeeRepository.findByBirthday(today.getMonthValue(), today.getDayOfMonth());

            for (Employee employee : employees) {
                notificationService.createNotification(
                    employee,
                    "INFO",
                    "Happy Birthday!",
                    "Wishing you a wonderful birthday! Have a great day!",
                    null
                );
            }

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed birthday reminder job in {}ms - {} birthdays found", duration, employees.size());

        } catch (Exception e) {
            logger.error("Error in birthday reminder job", e);
        }
    }

    /**
     * Cleanup old job logs (weekly on Sunday 3 AM)
     * Deletes job logs older than 180 days to maintain database performance
     */
    @Scheduled(cron = "0 0 3 * * SUN")
    @Transactional
    public void cleanupOldJobLogs() {
        String jobName = "JobLogCleanup";
        long startTime = System.currentTimeMillis();
        logger.info("Starting job log cleanup task");

        try {
            int daysToKeep = 180;
            int deletedCount = jobLogService.cleanupOldLogs(daysToKeep);

            long duration = System.currentTimeMillis() - startTime;
            logger.info("Completed job log cleanup in {}ms - {} logs deleted", duration, deletedCount);
            jobLogService.logSuccess(jobName, duration);

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            logger.error("Error in job log cleanup task", e);
            jobLogService.logFailure(jobName, duration, e.getMessage());
        }
    }
}
