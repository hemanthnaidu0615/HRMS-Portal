// Email validation
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Phone validation (international format)
export const validatePhone = (phone: string): boolean => {
  const regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return regex.test(phone);
};

// Password strength
export const validatePasswordStrength = (password: string): {
  score: number;
  feedback: string;
  isValid: boolean;
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Lowercase letter');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Uppercase letter');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Number');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Special character');

  return {
    score: (score / 5) * 100,
    feedback: feedback.join(', '),
    isValid: score >= 4
  };
};

// URL validation
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Number range validation
export const validateNumberRange = (value: number, min?: number, max?: number): boolean => {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

// Date validation
export const validateDateRange = (date: string, minDate?: string, maxDate?: string): boolean => {
  const d = new Date(date);
  if (minDate && d < new Date(minDate)) return false;
  if (maxDate && d > new Date(maxDate)) return false;
  return true;
};

// File validation
export const validateFile = (file: File, options: {
  maxSize?: number; // in MB
  allowedTypes?: string[];
}): { isValid: boolean; error?: string } => {
  if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
    return { isValid: false, error: `File size must be less than ${options.maxSize}MB` };
  }

  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type must be one of: ${options.allowedTypes.join(', ')}` };
  }

  return { isValid: true };
};

// Employee code validation
export const validateEmployeeCode = (code: string): boolean => {
  // Format: EMP-XXXX or EMPXXXX
  const regex = /^EMP-?\d{4,6}$/i;
  return regex.test(code);
};

// Tax ID / SSN validation (basic)
export const validateTaxId = (id: string): boolean => {
  // Removes dashes and checks length
  const cleaned = id.replace(/-/g, '');
  return cleaned.length >= 9 && cleaned.length <= 12 && /^\d+$/.test(cleaned);
};

// Salary validation
export const validateSalary = (salary: number, minSalary?: number, maxSalary?: number): {
  isValid: boolean;
  error?: string;
} => {
  if (salary <= 0) {
    return { isValid: false, error: 'Salary must be positive' };
  }

  if (minSalary && salary < minSalary) {
    return { isValid: false, error: `Salary must be at least ${minSalary}` };
  }

  if (maxSalary && salary > maxSalary) {
    return { isValid: false, error: `Salary cannot exceed ${maxSalary}` };
  }

  return { isValid: true };
};
