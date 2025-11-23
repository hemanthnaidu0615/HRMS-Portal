package com.hrms.validation.constraints;

import com.hrms.validation.validators.TaxIdValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Country-specific tax ID validation
 * Supports: SSN (USA), PAN/Aadhaar (India), NI (UK), SIN (Canada), TFN (Australia)
 */
@Documented
@Constraint(validatedBy = TaxIdValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidTaxId {
    String message() default "Invalid tax identification number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    /**
     * The field name containing the country code
     */
    String countryCodeField() default "countryCode";

    /**
     * The tax ID type (e.g., "SSN", "PAN", "NI_NUMBER")
     */
    String taxIdType() default "";
}
