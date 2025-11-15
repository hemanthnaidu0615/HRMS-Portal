package com.hrms.controller;

import com.hrms.dto.LoginRequest;
import com.hrms.dto.LoginResponse;
import com.hrms.dto.SetPasswordRequest;
import com.hrms.entity.User;
import com.hrms.service.JwtService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userService.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!userService.verifyPassword(user, loginRequest.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        LoginResponse response = new LoginResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toList()),
                user.isMustChangePassword()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@Valid @RequestBody SetPasswordRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isMustChangePassword()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password change not required"));
        }

        if (!userService.verifyPassword(user, request.getTemporaryPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid temporary password"));
        }

        userService.setNewPassword(user, request.getNewPassword());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully. Please log in with your new password.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Logout is handled client-side by clearing JWT from localStorage
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }
}
