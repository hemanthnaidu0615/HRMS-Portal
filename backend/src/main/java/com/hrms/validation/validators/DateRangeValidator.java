package com.hrms.validation.validators;

import com.hrms.validation.constraints.ValidDateRange;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * Validates that end date is after (or equal to) start date
 */
public class DateRangeValidator implements ConstraintValidator<ValidDateRange, Object> {

    private String startDateField;
    private String endDateField;
    private boolean allowEqual;
    private boolean allowNullEnd;

    @Override
    public void initialize(ValidDateRange constraintAnnotation) {
        this.startDateField = constraintAnnotation.startDateField();
        this.endDateField = constraintAnnotation.endDateField();
        this.allowEqual = constraintAnnotation.allowEqual();
        this.allowNullEnd = constraintAnnotation.allowNullEnd();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        try {
            BeanWrapper wrapper = new BeanWrapperImpl(value);

            Object startValue = wrapper.getPropertyValue(startDateField);
            Object endValue = wrapper.getPropertyValue(endDateField);

            // If start is null, we can't validate the range
            if (startValue == null) {
                return true;
            }

            // If end is null and we allow null end dates, it's valid
            if (endValue == null) {
                return allowNullEnd;
            }

            // Convert to comparable dates
            LocalDate startDate = toLocalDate(startValue);
            LocalDate endDate = toLocalDate(endValue);

            if (startDate == null || endDate == null) {
                return true; // Can't compare, let type validation handle it
            }

            // Compare dates
            int comparison = endDate.compareTo(startDate);

            if (comparison < 0) {
                setMessage(context, endDateField + " must be after " + startDateField);
                return false;
            }

            if (comparison == 0 && !allowEqual) {
                setMessage(context, endDateField + " must be strictly after " + startDateField);
                return false;
            }

            return true;
        } catch (Exception e) {
            return true; // Let other validation handle errors
        }
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof LocalDate) {
            return (LocalDate) value;
        } else if (value instanceof LocalDateTime) {
            return ((LocalDateTime) value).toLocalDate();
        } else if (value instanceof Date) {
            return new java.sql.Date(((Date) value).getTime()).toLocalDate();
        } else if (value instanceof java.sql.Date) {
            return ((java.sql.Date) value).toLocalDate();
        }
        return null;
    }

    private void setMessage(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
