package com.hrms.service;

import com.hrms.entity.EmailLog;
import com.hrms.repository.EmailLogRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailLogRepository emailLogRepository;

    @Value("${spring.mail.username:noreply@hrms.com}")
    private String fromEmail;

    @Async("emailTaskExecutor")
    public void sendTemporaryPasswordEmail(String to, String temporaryPassword) {
        String subject = "Your HRMS Account - Temporary Password";
        EmailLog emailLog = new EmailLog(to, "EMPLOYEE_CREATION", subject, EmailLog.EmailStatus.SUCCESS);

        try {
            String htmlContent = buildEmployeeCreationEmail(to, temporaryPassword);
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Temporary password email sent to: {}", to);
            emailLogRepository.save(emailLog);
        } catch (Exception e) {
            log.error("Failed to send temporary password email to: {}", to, e);
            emailLog.setStatus(EmailLog.EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
        }
    }

    @Async("emailTaskExecutor")
    public void sendPasswordResetEmail(String to, String token) {
        String subject = "HRMS Password Reset";
        EmailLog emailLog = new EmailLog(to, "PASSWORD_RESET", subject, EmailLog.EmailStatus.SUCCESS);

        try {
            String htmlContent = buildPasswordResetEmail(to, token);
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Password reset email sent to: {}", to);
            emailLogRepository.save(emailLog);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
            emailLog.setStatus(EmailLog.EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
        }
    }

    @Async("emailTaskExecutor")
    public void sendDocumentRequestEmail(String to, String requesterName, String documentType, String message) {
        sendDocumentRequestEmail(to, requesterName, documentType, message, null);
    }

    @Async("emailTaskExecutor")
    public void sendDocumentRequestEmail(String to, String requesterName, String documentType, String message,
            String requestId) {
        String subject = "Document Request from " + requesterName;
        EmailLog emailLog = new EmailLog(to, "DOCUMENT_REQUEST", subject, EmailLog.EmailStatus.SUCCESS, requestId,
                "DocumentRequest");

        try {
            String htmlContent = buildDocumentRequestEmail(to, requesterName, documentType, message);
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Document request email sent to: {} for document type: {}", to, documentType);
            emailLogRepository.save(emailLog);
        } catch (Exception e) {
            log.error("Failed to send document request email to: {}", to, e);
            emailLog.setStatus(EmailLog.EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
        }
    }

    @Async("emailTaskExecutor")
    public void sendDocumentUploadedEmail(String to, String uploaderName, String uploaderEmail, String documentType) {
        sendDocumentUploadedEmail(to, uploaderName, uploaderEmail, documentType, null);
    }

    @Async("emailTaskExecutor")
    public void sendDocumentUploadedEmail(String to, String uploaderName, String uploaderEmail, String documentType,
            String documentId) {
        String subject = "Document Uploaded by " + uploaderName;
        EmailLog emailLog = new EmailLog(to, "DOCUMENT_UPLOADED", subject, EmailLog.EmailStatus.SUCCESS, documentId,
                "Document");

        try {
            String htmlContent = buildDocumentUploadedEmail(to, uploaderName, uploaderEmail, documentType);
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Document uploaded notification sent to: {} for uploader: {}", to, uploaderEmail);
            emailLogRepository.save(emailLog);
        } catch (Exception e) {
            log.error("Failed to send document uploaded email to: {}", to, e);
            emailLog.setStatus(EmailLog.EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
        }
    }

    @Async("emailTaskExecutor")
    public void sendAssignmentChangeEmail(String to, String changeType, String details) {
        sendAssignmentChangeEmail(to, changeType, details, null);
    }

    @Async("emailTaskExecutor")
    public void sendAssignmentChangeEmail(String to, String changeType, String details, String employeeId) {
        String subject = "HRMS - " + changeType;
        EmailLog emailLog = new EmailLog(to, "ASSIGNMENT_CHANGE", subject, EmailLog.EmailStatus.SUCCESS, employeeId,
                "Employee");

        try {
            String htmlContent = buildAssignmentChangeEmail(to, changeType, details);
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Assignment change email sent to: {} for change type: {}", to, changeType);
            emailLogRepository.save(emailLog);
        } catch (Exception e) {
            log.error("Failed to send assignment change email to: {}", to, e);
            emailLog.setStatus(EmailLog.EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private String buildEmployeeCreationEmail(String email, String temporaryPassword) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0a0d54; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .credentials { background: white; padding: 15px; border-left: 4px solid #0a0d54; margin: 20px 0; }
                        .button { display: inline-block; background: #0a0d54; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to Enterprise HRMS</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>Your HRMS account has been successfully created. Please find your login credentials below:</p>

                            <div class="credentials">
                                <p><strong>Email:</strong> """
                + email + """
                        </p>
                                        <p><strong>Temporary Password:</strong> """ + temporaryPassword
                + """
                        </p>
                                    </div>

                                    <p><strong>Important:</strong> For security reasons, please log in and change your password immediately.</p>

                                    <p>If you have any questions or need assistance, please contact your HR administrator.</p>

                                    <p>Best regards,<br>HRMS Team</p>
                                </div>
                                <div class="footer">
                                    <p>This is an automated message. Please do not reply to this email.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """;
    }

    private String buildPasswordResetEmail(String email, String token) {
        String resetUrl = "https://frontend/reset-password/" + token;
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0a0d54; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #0a0d54; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>You have requested to reset your HRMS password. Click the button below to proceed:</p>

                            <a href=\""""
                + resetUrl + """
                        \" class="button">Reset Password</a>

                                    <div class="warning">
                                        <p><strong>Important:</strong></p>
                                        <ul>
                                            <li>This link will expire in 30 minutes</li>
                                            <li>If you did not request this reset, please ignore this email</li>
                                            <li>For security reasons, do not share this link with anyone</li>
                                        </ul>
                                    </div>

                                    <p>Best regards,<br>HRMS Team</p>
                                </div>
                                <div class="footer">
                                    <p>This is an automated message. Please do not reply to this email.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """;
    }

    private String buildDocumentRequestEmail(String recipientEmail, String requesterName, String documentType,
            String message) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0a0d54; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .request-box { background: white; padding: 20px; border-left: 4px solid #0a0d54; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Document Request</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p><strong>"""
                + requesterName + """
                        </strong> has requested a document from you.</p>

                                    <div class="request-box">
                                        <p><strong>Document Type:</strong> """ + documentType + """
                        </p>
                                        <p><strong>Message:</strong></p>
                                        <p>"""
                + (message != null && !message.isEmpty() ? message : "No additional message provided") + """
                        </p>
                                    </div>

                                    <p>Please log in to the HRMS portal to upload the requested document.</p>

                                    <p>Best regards,<br>HRMS Team</p>
                                </div>
                                <div class="footer">
                                    <p>This is an automated message. Please do not reply to this email.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """;
    }

    private String buildDocumentUploadedEmail(String recipientEmail, String uploaderName, String uploaderEmail,
            String documentType) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0a0d54; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .upload-box { background: white; padding: 20px; border-left: 4px solid #52c41a; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Document Uploaded</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>A document you requested has been uploaded.</p>

                            <div class="upload-box">
                                <p><strong>Uploaded by:</strong> """
                + uploaderName + " (" + uploaderEmail + ")</p>\n"
                + "<p><strong>Document Type:</strong> " + documentType + "</p>\n"
                + """
                                    </div>

                                    <p>Please log in to the HRMS portal to review the uploaded document.</p>

                                    <p>Best regards,<br>HRMS Team</p>
                                </div>
                                <div class="footer">
                                    <p>This is an automated message. Please do not reply to this email.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """;
    }

    private String buildAssignmentChangeEmail(String recipientEmail, String changeType, String details) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0a0d54; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .change-box { background: white; padding: 20px; border-left: 4px solid #1890ff; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>"""
                + changeType + """
                        </h1>
                                </div>
                                <div class="content">
                                    <p>Hello,</p>
                                    <p>Your employee information has been updated.</p>

                                    <div class="change-box">
                                        <p><strong>Change Details:</strong></p>
                                        <p>""" + details + """
                        </p>
                                    </div>

                                    <p>Please log in to the HRMS portal to view your updated information.</p>

                                    <p>If you have any questions, please contact your HR administrator.</p>

                                    <p>Best regards,<br>HRMS Team</p>
                                </div>
                                <div class="footer">
                                    <p>This is an automated message. Please do not reply to this email.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """;
    }

    // New notification email templates

    @Async("emailTaskExecutor")
    public void sendLeaveApprovalEmail(String to, String employeeName, String leaveType, String startDate, String endDate, String status) {
        String subject = "Leave Request " + status;
        EmailLog emailLog = new EmailLog(to, "LEAVE_APPROVAL", subject, EmailLog.EmailStatus.SUCCESS);

        try {
            String htmlContent = buildLeaveApprovalEmail(employeeName, leaveType, startDate, endDate, status);
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Leave approval email sent to: {}", to);
            emailLogRepository.save(emailLog);
        } catch (Exception e) {
            log.error("Failed to send leave approval email to: {}", to, e);
            emailLog.setStatus(EmailLog.EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
        }
    }

    @Async("emailTaskExecutor")
    public void sendTimesheetReminderEmail(String to, String employeeName, String periodStart, String periodEnd) {
        String subject = "Timesheet Submission Reminder";
        EmailLog emailLog = new EmailLog(to, "TIMESHEET_REMINDER", subject, EmailLog.EmailStatus.SUCCESS);

        try {
            String htmlContent = buildTimesheetReminderEmail(employeeName, periodStart, periodEnd);
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Timesheet reminder email sent to: {}", to);
            emailLogRepository.save(emailLog);
        } catch (Exception e) {
            log.error("Failed to send timesheet reminder email to: {}", to, e);
            emailLog.setStatus(EmailLog.EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
        }
    }

    @Async("emailTaskExecutor")
    public void sendPayrollGeneratedEmail(String to, String employeeName, String month, String netPay) {
        String subject = "Payslip Generated - " + month;
        EmailLog emailLog = new EmailLog(to, "PAYROLL_GENERATED", subject, EmailLog.EmailStatus.SUCCESS);

        try {
            String htmlContent = buildPayrollGeneratedEmail(employeeName, month, netPay);
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Payroll generated email sent to: {}", to);
            emailLogRepository.save(emailLog);
        } catch (Exception e) {
            log.error("Failed to send payroll generated email to: {}", to, e);
            emailLog.setStatus(EmailLog.EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
        }
    }

    @Async("emailTaskExecutor")
    public void sendGenericNotificationEmail(String to, String title, String message, String actionUrl) {
        String subject = title;
        EmailLog emailLog = new EmailLog(to, "GENERIC_NOTIFICATION", subject, EmailLog.EmailStatus.SUCCESS);

        try {
            String htmlContent = buildGenericNotificationEmail(title, message, actionUrl);
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Generic notification email sent to: {}", to);
            emailLogRepository.save(emailLog);
        } catch (Exception e) {
            log.error("Failed to send generic notification email to: {}", to, e);
            emailLog.setStatus(EmailLog.EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
        }
    }

    private String buildLeaveApprovalEmail(String employeeName, String leaveType, String startDate, String endDate, String status) {
        String statusColor = status.equalsIgnoreCase("APPROVED") ? "#52c41a" :
                           status.equalsIgnoreCase("REJECTED") ? "#ff4d4f" : "#faad14";

        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0a0d54; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .leave-box { background: white; padding: 20px; border-left: 4px solid %s; margin: 20px 0; }
                        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 4px; background: %s; color: white; font-weight: bold; margin: 10px 0; }
                        .button { display: inline-block; background: #0a0d54; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Leave Request Update</h1>
                        </div>
                        <div class="content">
                            <p>Hello %s,</p>
                            <p>Your leave request has been updated.</p>

                            <div class="leave-box">
                                <p><strong>Leave Type:</strong> %s</p>
                                <p><strong>Start Date:</strong> %s</p>
                                <p><strong>End Date:</strong> %s</p>
                                <p><strong>Status:</strong> <span class="status-badge">%s</span></p>
                            </div>

                            <p>Please log in to the HRMS portal to view full details.</p>

                            <p>Best regards,<br>HRMS Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, statusColor, statusColor, employeeName, leaveType, startDate, endDate, status);
    }

    private String buildTimesheetReminderEmail(String employeeName, String periodStart, String periodEnd) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0a0d54; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .reminder-box { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; }
                        .button { display: inline-block; background: #0a0d54; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Timesheet Reminder</h1>
                        </div>
                        <div class="content">
                            <p>Hello %s,</p>
                            <p>This is a friendly reminder to submit your timesheet.</p>

                            <div class="reminder-box">
                                <p><strong>Period:</strong> %s to %s</p>
                                <p>Please ensure your timesheet is submitted before the deadline to avoid any delays in processing.</p>
                            </div>

                            <p>Please log in to the HRMS portal to submit your timesheet.</p>

                            <p>Best regards,<br>HRMS Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, employeeName, periodStart, periodEnd);
    }

    private String buildPayrollGeneratedEmail(String employeeName, String month, String netPay) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0a0d54; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .payroll-box { background: white; padding: 20px; border-left: 4px solid #52c41a; margin: 20px 0; }
                        .amount { font-size: 24px; font-weight: bold; color: #0a0d54; margin: 10px 0; }
                        .button { display: inline-block; background: #0a0d54; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Payslip Available</h1>
                        </div>
                        <div class="content">
                            <p>Hello %s,</p>
                            <p>Your payslip for %s is now available.</p>

                            <div class="payroll-box">
                                <p><strong>Month:</strong> %s</p>
                                <p><strong>Net Pay:</strong></p>
                                <p class="amount">%s</p>
                            </div>

                            <p>Please log in to the HRMS portal to view and download your complete payslip.</p>

                            <p>Best regards,<br>HRMS Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, employeeName, month, month, netPay);
    }

    private String buildGenericNotificationEmail(String title, String message, String actionUrl) {
        String actionButton = actionUrl != null && !actionUrl.isEmpty()
            ? "<a href=\"" + actionUrl + "\" class=\"button\">View Details</a>"
            : "";

        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0a0d54; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .message-box { background: white; padding: 20px; border-left: 4px solid #1890ff; margin: 20px 0; }
                        .button { display: inline-block; background: #0a0d54; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>%s</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>

                            <div class="message-box">
                                <p>%s</p>
                            </div>

                            %s

                            <p>Best regards,<br>HRMS Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, title, message, actionButton);
    }
}
