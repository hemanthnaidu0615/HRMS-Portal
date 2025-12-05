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

    private final com.hrms.repository.RoleRepository roleRepository;

    public DataInitializer(UserService userService, com.hrms.repository.RoleRepository roleRepository) {
        this.userService = userService;
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        // Ensure roles exist
        createRoleIfNotFound("superadmin", true);
        createRoleIfNotFound("orgadmin", true);
        createRoleIfNotFound("employee", true);

        // Check if superadmin exists, if not create it
        if (userService.findByEmail(superAdminEmail).isEmpty()) {
            userService.createSuperAdmin(superAdminEmail, superAdminPassword);
            System.out.println("Superadmin user created: " + superAdminEmail);
        } else {
            System.out.println("Superadmin user already exists: " + superAdminEmail);
        }
    }

    private void createRoleIfNotFound(String name, boolean isSystemRole) {
        if (roleRepository.findByName(name).isEmpty()) {
            com.hrms.entity.Role role = new com.hrms.entity.Role();
            role.setName(name);
            role.setSystemRole(isSystemRole);
            roleRepository.save(role);
        }
    }
}
