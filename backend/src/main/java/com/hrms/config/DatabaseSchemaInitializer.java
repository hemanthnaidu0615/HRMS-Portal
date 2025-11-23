package com.hrms.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Comparator;
import java.util.stream.Collectors;

/**
 * Database Schema Initializer
 * Automatically runs SQL schema files on startup for development environments
 */
@Configuration
@Slf4j
@Profile({"dev", "local"})
public class DatabaseSchemaInitializer {

    @Value("${hrms.database.auto-init:false}")
    private boolean autoInit;

    @Value("${hrms.database.drop-existing:false}")
    private boolean dropExisting;

    @Value("${hrms.database.schema-dir:classpath:database/schema/modules/}")
    private String schemaDir;

    @Bean
    public CommandLineRunner initializeSchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            if (!autoInit) {
                log.info("Database auto-initialization is disabled. Set hrms.database.auto-init=true to enable.");
                return;
            }

            log.info("=".repeat(80));
            log.info("DATABASE SCHEMA AUTO-INITIALIZATION STARTING");
            log.info("=".repeat(80));

            try {
                // Drop existing tables if configured
                if (dropExisting) {
                    log.warn("DROP EXISTING TABLES IS ENABLED - ALL DATA WILL BE LOST!");
                    dropAllTables(jdbcTemplate);
                }

                // Load and execute schema files in order
                PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
                Resource[] resources = resolver.getResources(schemaDir + "*.sql");

                // Sort by filename (assumes naming like 01_core.sql, 02_roles.sql, etc.)
                Arrays.sort(resources, Comparator.comparing(Resource::getFilename));

                log.info("Found {} schema files to execute", resources.length);

                for (Resource resource : resources) {
                    String filename = resource.getFilename();
                    log.info("Executing schema file: {}", filename);

                    try (BufferedReader reader = new BufferedReader(
                            new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

                        String sql = reader.lines().collect(Collectors.joining("\n"));

                        // Split by GO statements (SQL Server) or by semicolons
                        String[] statements = sql.split("\\bGO\\b|;");

                        int executedCount = 0;
                        for (String statement : statements) {
                            String trimmed = statement.trim();

                            // Skip empty statements, comments, and PRINT statements
                            if (trimmed.isEmpty() ||
                                trimmed.startsWith("--") ||
                                trimmed.startsWith("/*") ||
                                trimmed.toUpperCase().startsWith("PRINT") ||
                                trimmed.toUpperCase().startsWith("SET NOCOUNT") ||
                                trimmed.toUpperCase().startsWith("SET XACT_ABORT")) {
                                continue;
                            }

                            try {
                                jdbcTemplate.execute(trimmed);
                                executedCount++;
                            } catch (Exception e) {
                                // Log but continue - some statements might fail if objects already exist
                                log.debug("Statement execution note (may be expected): {}", e.getMessage());
                            }
                        }

                        log.info("✓ {} - Executed {} statements", filename, executedCount);

                    } catch (Exception e) {
                        log.error("✗ {} - Error executing schema file: {}", filename, e.getMessage());
                        // Continue with next file instead of failing completely
                    }
                }

                log.info("=".repeat(80));
                log.info("DATABASE SCHEMA INITIALIZATION COMPLETED SUCCESSFULLY");
                log.info("=".repeat(80));

            } catch (Exception e) {
                log.error("Fatal error during schema initialization", e);
                throw new RuntimeException("Failed to initialize database schema", e);
            }
        };
    }

    private void dropAllTables(JdbcTemplate jdbcTemplate) {
        log.warn("Dropping all existing tables...");

        try {
            // Disable foreign key checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");

            // Get all tables
            String query = "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()";
            jdbcTemplate.query(query, (rs, rowNum) -> rs.getString("table_name"))
                    .forEach(tableName -> {
                        try {
                            jdbcTemplate.execute("DROP TABLE IF EXISTS " + tableName);
                            log.info("Dropped table: {}", tableName);
                        } catch (Exception e) {
                            log.warn("Could not drop table {}: {}", tableName, e.getMessage());
                        }
                    });

            // Re-enable foreign key checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            log.warn("All tables dropped successfully");

        } catch (Exception e) {
            log.error("Error dropping tables", e);
        }
    }
}
