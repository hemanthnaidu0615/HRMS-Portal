package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ScheduledJobLog Entity
 * Tracks execution of scheduled/cron jobs for monitoring and debugging
 */
@Entity
@Table(name = "scheduled_job_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduledJobLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_name", nullable = false, length = 100)
    private String jobName;

    @Column(name = "execution_time", nullable = false)
    private LocalDateTime executionTime;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // SUCCESS, FAILED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "duration_ms")
    private Long durationMs;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (executionTime == null) {
            executionTime = LocalDateTime.now();
        }
    }

    /**
     * Factory method to create a success log entry
     */
    public static ScheduledJobLog success(String jobName, long durationMs) {
        return ScheduledJobLog.builder()
                .jobName(jobName)
                .executionTime(LocalDateTime.now())
                .status("SUCCESS")
                .durationMs(durationMs)
                .build();
    }

    /**
     * Factory method to create a failure log entry
     */
    public static ScheduledJobLog failure(String jobName, long durationMs, String errorMessage) {
        return ScheduledJobLog.builder()
                .jobName(jobName)
                .executionTime(LocalDateTime.now())
                .status("FAILED")
                .durationMs(durationMs)
                .errorMessage(errorMessage)
                .build();
    }
}
