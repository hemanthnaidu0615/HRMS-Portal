import { Rule } from 'antd/es/form';
import {
  validateEmail,
  validatePhone,
  validatePasswordStrength,
  validateEmployeeCode,
  validateTaxId,
  validateSalary,
  validateNumberRange,
  validateDateRange,
} from './validators';
import dayjs from 'dayjs';

// Email validation rule
export const emailRule: Rule = {
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    if (validateEmail(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Please enter a valid email address'));
  },
};

// Phone validation rule
export const phoneRule: Rule = {
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    if (validatePhone(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Please enter a valid phone number'));
  },
};

// Password strength validation rule
export const passwordStrengthRule: Rule = {
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    const result = validatePasswordStrength(value);
    if (result.isValid) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Password must include: ${result.feedback}`));
  },
};

// Employee code validation rule
export const employeeCodeRule: Rule = {
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    if (validateEmployeeCode(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Invalid employee code format (e.g., EMP-1234)'));
  },
};

// Tax ID validation rule
export const taxIdRule: Rule = {
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    if (validateTaxId(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Please enter a valid tax identification number'));
  },
};

// Salary validation rule with range
export const salaryRule = (minSalary?: number, maxSalary?: number): Rule => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    const result = validateSalary(value, minSalary, maxSalary);
    if (result.isValid) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(result.error));
  },
});

// Number range validation rule
export const numberRangeRule = (min?: number, max?: number): Rule => ({
  validator: (_, value) => {
    if (value === undefined || value === null) return Promise.resolve();
    if (validateNumberRange(value, min, max)) {
      return Promise.resolve();
    }
    return Promise.reject(
      new Error(`Value must be between ${min ?? 'any'} and ${max ?? 'any'}`)
    );
  },
});

// Date cannot be in the future
export const noFutureDateRule: Rule = {
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    const date = dayjs(value);
    if (date.isAfter(dayjs(), 'day')) {
      return Promise.reject(new Error('Date cannot be in the future'));
    }
    return Promise.resolve();
  },
};

// Date cannot be in the past
export const noPastDateRule: Rule = {
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    const date = dayjs(value);
    if (date.isBefore(dayjs(), 'day')) {
      return Promise.reject(new Error('Date cannot be in the past'));
    }
    return Promise.resolve();
  },
};

// Date must be within last N days
export const withinLastDaysRule = (days: number): Rule => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    const date = dayjs(value);
    const minDate = dayjs().subtract(days, 'day');
    if (date.isBefore(minDate, 'day')) {
      return Promise.reject(new Error(`Date must be within the last ${days} days`));
    }
    return Promise.resolve();
  },
});

// End date must be after start date
export const endDateAfterStartDateRule = (startDateField: string): Rule => ({
  validator: (_, value, formInstance) => {
    if (!value) return Promise.resolve();
    const startDate = formInstance.getFieldValue(startDateField);
    if (!startDate) return Promise.resolve();

    if (dayjs(value).isBefore(dayjs(startDate))) {
      return Promise.reject(new Error('End date must be after start date'));
    }
    return Promise.resolve();
  },
});

// Minimum character count
export const minCharactersRule = (min: number): Rule => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    if (value.length >= min) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Must be at least ${min} characters`));
  },
});

// Salary range validation (min < max)
export const salaryRangeRule: Rule = {
  validator: (_, value, formInstance) => {
    if (!value) return Promise.resolve();
    const minSalary = formInstance.getFieldValue('salaryMin');
    const maxSalary = formInstance.getFieldValue('salaryMax');

    if (minSalary && maxSalary && minSalary >= maxSalary) {
      return Promise.reject(new Error('Maximum salary must be greater than minimum salary'));
    }
    return Promise.resolve();
  },
};

// Positive number validation
export const positiveNumberRule: Rule = {
  validator: (_, value) => {
    if (value === undefined || value === null) return Promise.resolve();
    if (value > 0) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Value must be positive'));
  },
};

// Required field with asterisk
export const requiredRule = (message?: string): Rule => ({
  required: true,
  message: message || 'This field is required',
});

// Hours validation (0.5 to 24)
export const hoursRule: Rule = {
  validator: (_, value) => {
    if (value === undefined || value === null) return Promise.resolve();
    if (value >= 0.5 && value <= 24) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Hours must be between 0.5 and 24'));
  },
};
