package com.hrms.validation.validators;

import com.hrms.validation.constraints.ValidPhone;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * Validates phone numbers with international format support
 */
public class PhoneValidator implements ConstraintValidator<ValidPhone, String> {

    // Country-specific phone patterns
    private static final Map<String, Pattern> COUNTRY_PATTERNS = Map.of(
            "USA", Pattern.compile("^\\+?1?[-.\\s]?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}$"),
            "IND", Pattern.compile("^\\+?91?[-.\\s]?[6-9][0-9]{9}$"),
            "GBR", Pattern.compile("^\\+?44?[-.\\s]?[0-9]{10,11}$"),
            "CAN", Pattern.compile("^\\+?1?[-.\\s]?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}$"),
            "AUS", Pattern.compile("^\\+?61?[-.\\s]?[0-9]{9,10}$"),
            "DEU", Pattern.compile("^\\+?49?[-.\\s]?[0-9]{10,12}$")
    );

    // Generic international phone pattern
    private static final Pattern GENERIC_PATTERN = Pattern.compile(
            "^\\+?[0-9]{1,4}?[-.\\s]?\\(?[0-9]{1,4}\\)?[-.\\s]?[0-9]{1,4}[-.\\s]?[0-9]{1,4}[-.\\s]?[0-9]{1,9}$"
    );

    private boolean allowEmpty;
    private String[] allowedCountries;

    @Override
    public void initialize(ValidPhone constraintAnnotation) {
        this.allowEmpty = constraintAnnotation.allowEmpty();
        this.allowedCountries = constraintAnnotation.allowedCountries();
    }

    @Override
    public boolean isValid(String phone, ConstraintValidatorContext context) {
        if (phone == null || phone.trim().isEmpty()) {
            return allowEmpty;
        }

        // Remove all whitespace and normalize
        String normalized = phone.replaceAll("\\s+", "");

        // Check minimum length
        String digitsOnly = normalized.replaceAll("[^0-9]", "");
        if (digitsOnly.length() < 7 || digitsOnly.length() > 15) {
            setMessage(context, "Phone number must have between 7 and 15 digits");
            return false;
        }

        // If specific countries are allowed, validate against them
        if (allowedCountries != null && allowedCountries.length > 0) {
            for (String country : allowedCountries) {
                Pattern pattern = COUNTRY_PATTERNS.get(country);
                if (pattern != null && pattern.matcher(normalized).matches()) {
                    return true;
                }
            }
            setMessage(context, "Phone number does not match allowed country formats");
            return false;
        }

        // Try country-specific patterns first
        for (Pattern pattern : COUNTRY_PATTERNS.values()) {
            if (pattern.matcher(normalized).matches()) {
                return true;
            }
        }

        // Fall back to generic pattern
        if (GENERIC_PATTERN.matcher(normalized).matches()) {
            return true;
        }

        setMessage(context, "Invalid phone number format");
        return false;
    }

    private void setMessage(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
