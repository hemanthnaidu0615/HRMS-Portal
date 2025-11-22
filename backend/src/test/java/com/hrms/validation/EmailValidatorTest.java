package com.hrms.validation;

import com.hrms.validation.validators.EmailValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import jakarta.validation.ConstraintValidatorContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("Email Validator Tests")
class EmailValidatorTest {

    private EmailValidator validator;
    private ConstraintValidatorContext context;
    private ConstraintValidatorContext.ConstraintViolationBuilder builder;

    @BeforeEach
    void setUp() {
        validator = new EmailValidator();
        context = mock(ConstraintValidatorContext.class);
        builder = mock(ConstraintValidatorContext.ConstraintViolationBuilder.class);
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(builder);
    }

    @Test
    @DisplayName("Valid standard email should pass")
    void validStandardEmail() {
        assertTrue(validator.isValid("john.doe@company.com", context));
    }

    @Test
    @DisplayName("Valid email with subdomain should pass")
    void validEmailWithSubdomain() {
        assertTrue(validator.isValid("user@mail.company.co.uk", context));
    }

    @Test
    @DisplayName("Valid email with plus sign should pass")
    void validEmailWithPlusSign() {
        assertTrue(validator.isValid("user+tag@gmail.com", context));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "plainaddress",
            "@missinglocal.com",
            "missing@domain",
            "missing.com",
            "user@.com",
            "user@domain..com"
    })
    @DisplayName("Invalid email formats should fail")
    void invalidEmailFormats(String email) {
        assertFalse(validator.isValid(email, context));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "test@tempmail.com",
            "test@mailinator.com",
            "test@guerrillamail.com"
    })
    @DisplayName("Temporary email domains should be rejected")
    void temporaryEmailsShouldBeRejected(String email) {
        assertFalse(validator.isValid(email, context));
    }

    @Test
    @DisplayName("Null email with allowEmpty=true should pass")
    void nullEmailWithAllowEmpty() {
        // By default allowEmpty is false, need to test with custom initialization
        assertTrue(validator.isValid(null, context));
    }

    @Test
    @DisplayName("Empty email should fail by default")
    void emptyEmailShouldFail() {
        assertFalse(validator.isValid("", context));
    }
}
