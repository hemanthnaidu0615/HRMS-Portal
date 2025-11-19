/**
 * API Configuration
 * Central configuration for API endpoints and base URLs
 */

// API Base URL - defaults to same origin for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    SET_PASSWORD: '/api/auth/set-password',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },

  // Employees
  EMPLOYEES: '/api/employees',

  // Departments
  DEPARTMENTS: '/api/departments',

  // Positions
  POSITIONS: '/api/positions',

  // Documents
  DOCUMENTS: '/api/documents',

  // Document Requests
  DOCUMENT_REQUESTS: '/api/document-requests',

  // Organizations
  ORGANIZATIONS: '/api/organizations',

  // Roles
  ROLES: '/api/roles',

  // Permissions
  PERMISSIONS: '/api/permissions',

  // Audit Logs
  AUDIT_LOGS: '/api/audit-logs',

  // Vendors
  VENDORS: '/api/vendors',

  // Clients
  CLIENTS: '/api/clients',

  // Projects
  PROJECTS: {
    PROJECTS: '/api/projects',
    TASKS: '/api/projects/tasks',
  },

  // Attendance
  ATTENDANCE: {
    RECORDS: '/api/attendance/attendance-record',
    REGULARIZATION: '/api/attendance/attendance-regularization',
    SHIFTS: '/api/attendance/shift',
  },

  // Leave
  LEAVE: {
    APPLICATIONS: '/api/leave/leave-application',
    BALANCES: '/api/leave/leave-balance',
    TYPES: '/api/leave/leave-type',
  },

  // Timesheet
  TIMESHEET: {
    ENTRIES: '/api/timesheet/timesheet-entry',
  },

  // Payroll
  PAYROLL: {
    RUNS: '/api/payroll/payroll-run',
    PAYSLIPS: '/api/payroll/payslip',
    COMPONENTS: '/api/payroll/salary-component',
  },

  // Performance
  PERFORMANCE: {
    REVIEWS: '/api/performance/performance-review',
    GOALS: '/api/performance/employee-goal',
    CYCLES: '/api/performance/performance-cycle',
  },

  // Recruitment
  RECRUITMENT: {
    JOBS: '/api/recruitment/job-posting',
    APPLICATIONS: '/api/recruitment/job-application',
    INTERVIEWS: '/api/recruitment/interview-schedule',
  },

  // Assets
  ASSETS: {
    ASSETS: '/api/assets/asset',
    ASSIGNMENTS: '/api/assets/asset-assignment',
    CATEGORIES: '/api/assets/asset-category',
  },

  // Expenses
  EXPENSES: {
    CLAIMS: '/api/expenses/expense-claim',
    CATEGORIES: '/api/expenses/expense-category',
  },

  // Notifications
  NOTIFICATIONS: '/api/notifications',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
