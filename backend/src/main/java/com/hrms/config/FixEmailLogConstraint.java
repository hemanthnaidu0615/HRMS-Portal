package com.hrms.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class FixEmailLogConstraint implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Check if constraint exists before dropping to avoid errors in logs
            // This syntax is for SQL Server
            String sql = "IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'chk_el_status') " +
                         "BEGIN " +
                         "    ALTER TABLE email_logs DROP CONSTRAINT chk_el_status; " +
                         "END";
            jdbcTemplate.execute(sql);
            System.out.println("Successfully processed constraint chk_el_status removal.");
        } catch (Exception e) {
            System.out.println("Error processing constraint removal: " + e.getMessage());
        }
    }
}
