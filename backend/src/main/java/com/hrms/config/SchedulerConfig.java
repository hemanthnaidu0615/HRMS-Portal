package com.hrms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Scheduler Configuration
 * Enables Spring's scheduled task execution capability
 * Used for running cron jobs like timesheet reminders, leave balance notifications, etc.
 */
@Configuration
@EnableScheduling
public class SchedulerConfig {
    // Spring will automatically detect @Scheduled methods
    // Configuration can be extended here if needed
}
