package com.hrms.repository;

import com.hrms.entity.ScheduledJobLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for ScheduledJobLog entity
 * Provides data access methods for scheduled job execution logs
 */
@Repository
public interface ScheduledJobLogRepository extends JpaRepository<ScheduledJobLog, UUID> {

    /**
     * Find logs by job name ordered by execution time descending
     */
    Page<ScheduledJobLog> findByJobNameOrderByExecutionTimeDesc(String jobName, Pageable pageable);

    /**
     * Find logs by status ordered by execution time descending
     */
    Page<ScheduledJobLog> findByStatusOrderByExecutionTimeDesc(String status, Pageable pageable);

    /**
     * Find logs by job name and status
     */
    List<ScheduledJobLog> findByJobNameAndStatusOrderByExecutionTimeDesc(String jobName, String status);

    /**
     * Find recent logs (last 100)
     */
    List<ScheduledJobLog> findTop100ByOrderByExecutionTimeDesc();

    /**
     * Find recent logs for a specific job
     */
    List<ScheduledJobLog> findTop10ByJobNameOrderByExecutionTimeDesc(String jobName);

    /**
     * Find logs within a date range
     */
    @Query("SELECT j FROM ScheduledJobLog j WHERE j.executionTime BETWEEN :start AND :end ORDER BY j.executionTime DESC")
    List<ScheduledJobLog> findByExecutionTimeBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Count failed executions for a job
     */
    @Query("SELECT COUNT(j) FROM ScheduledJobLog j WHERE j.jobName = :jobName AND j.status = 'FAILED'")
    Long countFailedExecutions(@Param("jobName") String jobName);

    /**
     * Get average duration for a job
     */
    @Query("SELECT AVG(j.durationMs) FROM ScheduledJobLog j WHERE j.jobName = :jobName AND j.status = 'SUCCESS'")
    Double getAverageDuration(@Param("jobName") String jobName);

    /**
     * Delete old logs (cleanup)
     */
    @Modifying
    @Query("DELETE FROM ScheduledJobLog j WHERE j.executionTime < :before")
    void deleteOldLogs(@Param("before") LocalDateTime before);

    /**
     * Find logs created after a specific date
     */
    List<ScheduledJobLog> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime after);
}
