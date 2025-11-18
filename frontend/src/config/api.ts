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
  PROJECTS: '/api/projects',

  // Attendance
  ATTENDANCE: {
    RECORDS: '/api/attendance/records',
    REGULARIZATION: '/api/attendance/regularization',
    SHIFTS: '/api/attendance/shifts',
    POLICIES: '/api/attendance/policies',
    REPORTS: '/api/attendance/reports',
  },

  // Leave
  LEAVE: {
    REQUESTS: '/api/leave/requests',
    BALANCES: '/api/leave/balances',
    TYPES: '/api/leave/types',
    POLICIES: '/api/leave/policies',
  },

  // Timesheet
  TIMESHEET: {
    ENTRIES: '/api/timesheet/entries',
    APPROVALS: '/api/timesheet/approvals',
    PROJECTS: '/api/timesheet/projects',
  },

  // Payroll
  PAYROLL: {
    PAYROLLS: '/api/payroll/payrolls',
    COMPONENTS: '/api/payroll/components',
    DEDUCTIONS: '/api/payroll/deductions',
    BONUSES: '/api/payroll/bonuses',
  },

  // Performance
  PERFORMANCE: {
    REVIEWS: '/api/performance/reviews',
    GOALS: '/api/performance/goals',
    FEEDBACK: '/api/performance/feedback',
    RATINGS: '/api/performance/ratings',
  },

  // Recruitment
  RECRUITMENT: {
    JOBS: '/api/recruitment/jobs',
    APPLICATIONS: '/api/recruitment/applications',
    INTERVIEWS: '/api/recruitment/interviews',
    OFFERS: '/api/recruitment/offers',
  },

  // Assets
  ASSETS: {
    ASSETS: '/api/assets/assets',
    ASSIGNMENTS: '/api/assets/assignments',
    CATEGORIES: '/api/assets/categories',
  },

  // Expenses
  EXPENSES: {
    CLAIMS: '/api/expenses/claims',
    CATEGORIES: '/api/expenses/categories',
    APPROVALS: '/api/expenses/approvals',
  },

  // Notifications
  NOTIFICATIONS: '/api/notifications',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
