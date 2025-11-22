package com.hrms.validation.constraints;

import com.hrms.validation.validators.BankAccountValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Country-specific bank account validation
 * Validates routing numbers, IFSC codes, sort codes, etc.
 */
@Documented
@Constraint(validatedBy = BankAccountValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidBankAccount {
    String message() default "Invalid bank account information";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
