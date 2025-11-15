package com.hrms.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTemporaryPasswordEmail(String to, String temporaryPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your HRMS Account - Temporary Password");
        message.setText("Welcome to HRMS!\n\n" +
                "Your account has been created.\n\n" +
                "Email: " + to + "\n" +
                "Temporary Password: " + temporaryPassword + "\n\n" +
                "Please log in and change your password immediately.\n\n" +
                "Best regards,\n" +
                "HRMS Team");

        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("HRMS Password Reset");
        message.setText("You have requested to reset your password.\n\n" +
                "Please use the following link to reset your password:\n\n" +
                "https://frontend/reset-password/" + token + "\n\n" +
                "This link will expire in 30 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "HRMS Team");

        mailSender.send(message);
    }
}
