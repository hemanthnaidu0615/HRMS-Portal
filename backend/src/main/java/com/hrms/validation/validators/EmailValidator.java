package com.hrms.validation.validators;

import com.hrms.validation.constraints.ValidEmail;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * Validates email addresses with strict rules
 */
public class EmailValidator implements ConstraintValidator<ValidEmail, String> {

    // RFC 5322 compliant email regex (simplified)
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
    );

    // Common invalid patterns
    private static final Pattern CONSECUTIVE_DOTS = Pattern.compile("\\.{2,}");
    private static final Pattern STARTS_OR_ENDS_WITH_DOT = Pattern.compile("^\\.|\\.$");

    // Blocked temporary email domains
    private static final String[] BLOCKED_DOMAINS = {
            "tempmail.com", "throwaway.email", "guerrillamail.com", "mailinator.com",
            "10minutemail.com", "yopmail.com", "fakeinbox.com", "trashmail.com"
    };

    private boolean allowEmpty;

    @Override
    public void initialize(ValidEmail constraintAnnotation) {
        this.allowEmpty = constraintAnnotation.allowEmpty();
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.trim().isEmpty()) {
            return allowEmpty;
        }

        String trimmedEmail = email.trim().toLowerCase();

        // Basic pattern check
        if (!EMAIL_PATTERN.matcher(trimmedEmail).matches()) {
            setMessage(context, "Email does not match valid format");
            return false;
        }

        // Check for consecutive dots
        if (CONSECUTIVE_DOTS.matcher(trimmedEmail).find()) {
            setMessage(context, "Email cannot contain consecutive dots");
            return false;
        }

        // Check local part doesn't start or end with dot
        String localPart = trimmedEmail.substring(0, trimmedEmail.indexOf('@'));
        if (STARTS_OR_ENDS_WITH_DOT.matcher(localPart).find()) {
            setMessage(context, "Email local part cannot start or end with a dot");
            return false;
        }

        // Check for blocked domains
        String domain = trimmedEmail.substring(trimmedEmail.indexOf('@') + 1);
        for (String blocked : BLOCKED_DOMAINS) {
            if (domain.equals(blocked) || domain.endsWith("." + blocked)) {
                setMessage(context, "Temporary or disposable email addresses are not allowed");
                return false;
            }
        }

        // Check minimum length requirements
        if (localPart.length() < 1 || domain.length() < 4) {
            setMessage(context, "Email address is too short");
            return false;
        }

        // Check domain has at least one dot
        if (!domain.contains(".")) {
            setMessage(context, "Email domain must contain a dot");
            return false;
        }

        return true;
    }

    private void setMessage(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
