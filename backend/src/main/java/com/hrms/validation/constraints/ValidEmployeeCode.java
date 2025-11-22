package com.hrms.validation.constraints;

import com.hrms.validation.validators.EmployeeCodeValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates employee code format and uniqueness
 */
@Documented
@Constraint(validatedBy = EmployeeCodeValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEmployeeCode {
    String message() default "Invalid employee code format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    /**
     * Regex pattern for employee code
     * Default: alphanumeric with optional prefix
     */
    String pattern() default "^[A-Z]{2,4}[0-9]{4,8}$";

    /**
     * Minimum length
     */
    int minLength() default 6;

    /**
     * Maximum length
     */
    int maxLength() default 12;
}
