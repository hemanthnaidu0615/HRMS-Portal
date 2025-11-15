package com.hrms.controller;

import com.hrms.dto.ForgotPasswordRequest;
import com.hrms.dto.ResetPasswordRequest;
import com.hrms.entity.PasswordResetToken;
import com.hrms.entity.User;
import com.hrms.service.EmailService;
import com.hrms.service.PasswordResetService;
import com.hrms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class PasswordResetController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;

    public PasswordResetController(UserService userService,
                                  PasswordResetService passwordResetService,
                                  EmailService emailService) {
        this.userService = userService;
        this.passwordResetService = passwordResetService;
        this.emailService = emailService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        // Never reveal whether email exists or not
        Optional<User> userOptional = userService.findByEmail(request.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = passwordResetService.createTokenForUser(user);

            try {
                emailService.sendPasswordResetEmail(user.getEmail(), token);
            } catch (Exception e) {
                // Log error but don't fail the request
                System.err.println("Failed to send password reset email: " + e.getMessage());
            }
        }

        // Always return success message
        return ResponseEntity.ok(Map.of("message", "Reset link sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            // Validate token
            PasswordResetToken resetToken = passwordResetService.validateToken(request.getToken());

            // Update password
            User user = resetToken.getUser();
            userService.setNewPassword(user, request.getNewPassword());

            // Mark token as used
            passwordResetService.markUsed(resetToken);

            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
