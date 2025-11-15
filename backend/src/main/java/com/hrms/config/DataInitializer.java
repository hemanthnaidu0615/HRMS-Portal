package com.hrms.config;

import com.hrms.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;

    @Value("${superadmin.email}")
    private String superAdminEmail;

    @Value("${superadmin.password}")
    private String superAdminPassword;

    public DataInitializer(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void run(String... args) {
        // Check if superadmin exists, if not create it
        if (userService.findByEmail(superAdminEmail).isEmpty()) {
            userService.createSuperAdmin(superAdminEmail, superAdminPassword);
            System.out.println("Superadmin user created: " + superAdminEmail);
        } else {
            System.out.println("Superadmin user already exists: " + superAdminEmail);
        }
    }
}
