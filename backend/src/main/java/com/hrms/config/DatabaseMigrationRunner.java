package com.hrms.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationRunner.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        logger.info("Running database migrations...");

        try {
            // Add deleted_by column if it doesn't exist
            addDeletedByColumn();

            // Add github_profile column if it doesn't exist
            addGithubProfileColumn();

            logger.info("Database migrations completed successfully");
        } catch (Exception e) {
            logger.error("Error running database migrations", e);
            // Don't throw exception to allow app to start
        }
    }

    private void addDeletedByColumn() {
        try {
            String checkColumnSql =
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_NAME = 'employees' AND COLUMN_NAME = 'deleted_by'";

            Integer count = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);

            if (count == null || count == 0) {
                logger.info("Adding deleted_by column to employees table...");
                String alterTableSql = "ALTER TABLE employees ADD deleted_by UNIQUEIDENTIFIER NULL";
                jdbcTemplate.execute(alterTableSql);
                logger.info("Successfully added deleted_by column");
            } else {
                logger.info("deleted_by column already exists");
            }
        } catch (Exception e) {
            logger.error("Error adding deleted_by column", e);
        }
    }

    private void addGithubProfileColumn() {
        try {
            String checkColumnSql =
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_NAME = 'employees' AND COLUMN_NAME = 'github_profile'";

            Integer count = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);

            if (count == null || count == 0) {
                logger.info("Adding github_profile column to employees table...");
                String alterTableSql = "ALTER TABLE employees ADD github_profile VARCHAR(255) NULL";
                jdbcTemplate.execute(alterTableSql);
                logger.info("Successfully added github_profile column");
            } else {
                logger.info("github_profile column already exists");
            }
        } catch (Exception e) {
            logger.error("Error adding github_profile column", e);
        }
    }
}
