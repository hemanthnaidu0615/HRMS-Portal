package com.hrms.service;

import com.hrms.entity.Organization;
import com.hrms.entity.Role;
import com.hrms.entity.User;
import com.hrms.repository.RoleRepository;
import com.hrms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No authenticated user found");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public User createSuperAdmin(String email, String password) {
        User user = new User(email, passwordEncoder.encode(password));
        user.setMustChangePassword(false);

        Role superAdminRole = roleRepository.findByName("superadmin")
                .orElseThrow(() -> new RuntimeException("Superadmin role not found"));

        user.addRole(superAdminRole);
        return userRepository.save(user);
    }

    @Transactional
    public User createOrgAdmin(String email, String temporaryPassword, Organization organization) {
        User user = new User(email, passwordEncoder.encode(temporaryPassword));
        user.setOrganization(organization);
        user.setMustChangePassword(true);

        Role orgAdminRole = roleRepository.findByName("orgadmin")
                .orElseThrow(() -> new RuntimeException("Orgadmin role not found"));

        user.addRole(orgAdminRole);
        return userRepository.save(user);
    }

    @Transactional
    public User createEmployee(String email, String temporaryPassword, Organization organization) {
        User user = new User(email, passwordEncoder.encode(temporaryPassword));
        user.setOrganization(organization);
        user.setMustChangePassword(true);

        Role employeeRole = roleRepository.findByName("employee")
                .orElseThrow(() -> new RuntimeException("Employee role not found"));

        user.addRole(employeeRole);
        return userRepository.save(user);
    }

    @Transactional
    public void setNewPassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    public boolean verifyPassword(User user, String password) {
        return passwordEncoder.matches(password, user.getPassword());
    }
}
