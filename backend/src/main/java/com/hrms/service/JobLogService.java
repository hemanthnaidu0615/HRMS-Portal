package com.hrms.service;

import com.hrms.entity.ScheduledJobLog;
import com.hrms.repository.ScheduledJobLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * JobLogService
 * Manages logging and tracking of scheduled job executions
 * Provides methods to log job executions and query job history
 */
@Service
public class JobLogService {

    private static final Logger logger = LoggerFactory.getLogger(JobLogService.class);

    @Autowired
    private ScheduledJobLogRepository jobLogRepository;

    /**
     * Log a successful job execution
     */
    @Transactional
    public void logSuccess(String jobName, long durationMs) {
        try {
            ScheduledJobLog log = ScheduledJobLog.success(jobName, durationMs);
            jobLogRepository.save(log);
            logger.debug("Logged successful execution of job: {} ({}ms)", jobName, durationMs);
        } catch (Exception e) {
            logger.error("Failed to log job success for: " + jobName, e);
        }
    }

    /**
     * Log a failed job execution
     */
    @Transactional
    public void logFailure(String jobName, long durationMs, String errorMessage) {
        try {
            ScheduledJobLog log = ScheduledJobLog.failure(jobName, durationMs, errorMessage);
            jobLogRepository.save(log);
            logger.warn("Logged failed execution of job: {} ({}ms) - Error: {}", jobName, durationMs, errorMessage);
        } catch (Exception e) {
            logger.error("Failed to log job failure for: " + jobName, e);
        }
    }

    /**
     * Generic method to log job execution with all parameters
     */
    @Transactional
    public void logJobExecution(String jobName, String status, String errorMessage, long durationMs) {
        try {
            ScheduledJobLog log = ScheduledJobLog.builder()
                    .jobName(jobName)
                    .executionTime(LocalDateTime.now())
                    .status(status)
                    .errorMessage(errorMessage)
                    .durationMs(durationMs)
                    .build();

            jobLogRepository.save(log);
            logger.debug("Logged {} execution of job: {} ({}ms)", status, jobName, durationMs);
        } catch (Exception e) {
            logger.error("Failed to log job execution for: " + jobName, e);
        }
    }

    /**
     * Get recent logs for a specific job
     */
    public List<ScheduledJobLog> getRecentLogsForJob(String jobName, int limit) {
        return jobLogRepository.findTop10ByJobNameOrderByExecutionTimeDesc(jobName);
    }

    /**
     * Get all logs for a job with pagination
     */
    public Page<ScheduledJobLog> getLogsForJob(String jobName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return jobLogRepository.findByJobNameOrderByExecutionTimeDesc(jobName, pageable);
    }

    /**
     * Get failed executions for a job
     */
    public List<ScheduledJobLog> getFailedExecutions(String jobName) {
        return jobLogRepository.findByJobNameAndStatusOrderByExecutionTimeDesc(jobName, "FAILED");
    }

    /**
     * Get count of failed executions for a job
     */
    public Long countFailedExecutions(String jobName) {
        return jobLogRepository.countFailedExecutions(jobName);
    }

    /**
     * Get average duration for a job
     */
    public Double getAverageDuration(String jobName) {
        return jobLogRepository.getAverageDuration(jobName);
    }

    /**
     * Get logs within a date range
     */
    public List<ScheduledJobLog> getLogsBetween(LocalDateTime start, LocalDateTime end) {
        return jobLogRepository.findByExecutionTimeBetween(start, end);
    }

    /**
     * Get recent logs (last 100)
     */
    public List<ScheduledJobLog> getRecentLogs() {
        return jobLogRepository.findTop100ByOrderByExecutionTimeDesc();
    }

    /**
     * Get logs by status with pagination
     */
    public Page<ScheduledJobLog> getLogsByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return jobLogRepository.findByStatusOrderByExecutionTimeDesc(status, pageable);
    }

    /**
     * Cleanup old logs (older than specified days)
     * Called by scheduled cleanup job
     */
    @Transactional
    public int cleanupOldLogs(int daysToKeep) {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);

            // Count logs to be deleted
            List<ScheduledJobLog> logsToDelete = jobLogRepository.findByExecutionTimeBetween(
                LocalDateTime.now().minusYears(10),
                cutoffDate
            );
            int count = logsToDelete.size();

            // Delete old logs
            jobLogRepository.deleteOldLogs(cutoffDate);

            logger.info("Cleaned up {} old job logs (older than {} days)", count, daysToKeep);
            return count;
        } catch (Exception e) {
            logger.error("Failed to cleanup old job logs", e);
            return 0;
        }
    }

    /**
     * Get job execution statistics
     */
    public JobStatistics getJobStatistics(String jobName) {
        Long failedCount = countFailedExecutions(jobName);
        Double avgDuration = getAverageDuration(jobName);
        List<ScheduledJobLog> recentLogs = getRecentLogsForJob(jobName, 10);

        long totalExecutions = recentLogs.size();
        long successCount = totalExecutions - failedCount;

        return new JobStatistics(
            jobName,
            totalExecutions,
            successCount,
            failedCount,
            avgDuration != null ? avgDuration : 0.0
        );
    }

    /**
     * Inner class for job statistics
     */
    public static class JobStatistics {
        public final String jobName;
        public final long totalExecutions;
        public final long successCount;
        public final long failedCount;
        public final double averageDurationMs;

        public JobStatistics(String jobName, long totalExecutions, long successCount,
                           long failedCount, double averageDurationMs) {
            this.jobName = jobName;
            this.totalExecutions = totalExecutions;
            this.successCount = successCount;
            this.failedCount = failedCount;
            this.averageDurationMs = averageDurationMs;
        }
    }
}
