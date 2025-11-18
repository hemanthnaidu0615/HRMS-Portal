import React from 'react';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  FolderOutlined,
  InboxOutlined,
  SendOutlined,
  BankOutlined,
  ShopOutlined,
  IdcardOutlined,
  ProjectOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  DollarOutlined,
  TrophyOutlined,
  LaptopOutlined,
  WalletOutlined,
} from '@ant-design/icons';

type MenuItem = Required<MenuProps>['items'][number];

/**
 * Navigation Configuration
 * Role-based menu items for the application
 */

// Helper function to create menu items
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

/**
 * SuperAdmin Navigation
 */
export const superAdminMenuItems: MenuItem[] = [
  getItem('Dashboard', '/superadmin/dashboard', <DashboardOutlined />),
  getItem('Organizations', '/superadmin/organizations', <BankOutlined />),
  getItem('Profile', '/profile', <UserOutlined />),
  getItem('My Permissions', '/permissions', <SafetyCertificateOutlined />),
];

/**
 * Admin Navigation (Organization Administrator)
 */
export const orgAdminMenuItems: MenuItem[] = [
  getItem('Dashboard', '/admin/dashboard', <DashboardOutlined />),

  getItem('Employees', 'employees', <TeamOutlined />, [
    getItem('Employee Directory', '/admin/employees'),
    getItem('Organization Chart', '/admin/employees/tree'),
    getItem('Add Employee', '/admin/employees/create'),
    getItem('Bulk Import', '/admin/employees/import'),
  ]),

  getItem('Organization', 'structure', <ApartmentOutlined />, [
    getItem('Departments', '/admin/structure/departments'),
    getItem('Positions', '/admin/structure/positions'),
  ]),

  getItem('Vendors', 'vendors', <ShopOutlined />, [
    getItem('All Vendors', '/admin/vendors'),
    getItem('Add Vendor', '/admin/vendors/create'),
  ]),

  getItem('Clients', 'clients', <IdcardOutlined />, [
    getItem('All Clients', '/admin/clients'),
    getItem('Add Client', '/admin/clients/create'),
  ]),

  getItem('Projects', 'projects', <ProjectOutlined />, [
    getItem('All Projects', '/admin/projects/projects'),
    getItem('Project Tasks', '/admin/projects/tasks'),
    getItem('Add Project', '/admin/projects/projects/create'),
  ]),

  getItem('Access Control', 'permissions', <SafetyCertificateOutlined />, [
    getItem('Roles', '/admin/roles'),
    getItem('Permission Groups', '/admin/permissions/groups'),
  ]),

  getItem('Attendance', 'attendance', <ClockCircleOutlined />, [
    getItem('Attendance Records', '/admin/attendance/records'),
    getItem('Regularization Requests', '/admin/attendance/regularization'),
    getItem('Shift Management', '/admin/attendance/shifts'),
  ]),

  getItem('Leave', 'leave', <CalendarOutlined />, [
    getItem('Leave Applications', '/admin/leave/applications'),
    getItem('Leave Balances', '/admin/leave/balances'),
    getItem('Leave Types', '/admin/leave/types'),
  ]),

  getItem('Timesheet', 'timesheet', <FieldTimeOutlined />, [
    getItem('Timesheet Entries', '/admin/timesheet/entries'),
    getItem('Pending Approvals', '/admin/timesheet/approvals'),
  ]),

  getItem('Payroll', 'payroll', <DollarOutlined />, [
    getItem('Payroll Runs', '/admin/payroll/runs'),
    getItem('Payslips', '/admin/payroll/payslips'),
    getItem('Salary Components', '/admin/payroll/components'),
  ]),

  getItem('Performance', 'performance', <TrophyOutlined />, [
    getItem('Performance Reviews', '/admin/performance/reviews'),
    getItem('Employee Goals', '/admin/performance/goals'),
    getItem('Review Cycles', '/admin/performance/cycles'),
  ]),

  getItem('Recruitment', 'recruitment', <TeamOutlined />, [
    getItem('Job Postings', '/admin/recruitment/jobs'),
    getItem('Applications', '/admin/recruitment/applications'),
    getItem('Interview Schedules', '/admin/recruitment/interviews'),
  ]),

  getItem('Assets', 'assets', <LaptopOutlined />, [
    getItem('All Assets', '/admin/assets/assets'),
    getItem('Asset Assignments', '/admin/assets/assignments'),
    getItem('Asset Categories', '/admin/assets/categories'),
  ]),

  getItem('Expenses', 'expenses', <WalletOutlined />, [
    getItem('Expense Claims', '/admin/expenses/claims'),
    getItem('Expense Categories', '/admin/expenses/categories'),
  ]),

  getItem('Audit Logs', '/admin/audit-logs', <HistoryOutlined />),

  getItem('Documents', 'documents', <FileTextOutlined />, [
    getItem('All Documents', '/documents/org'),
    getItem('All Document Requests', '/document-requests/org'),
    getItem('Request Document', '/document-requests/create'),
  ]),

  getItem('Profile', '/profile', <UserOutlined />),
];

/**
 * Employee Navigation
 */
export const employeeMenuItems: MenuItem[] = [
  getItem('Dashboard', '/employee/dashboard', <DashboardOutlined />),

  getItem('My Documents', 'my-documents', <FolderOutlined />, [
    getItem('My Documents', '/documents/me'),
    getItem('Upload Document', '/documents/upload'),
    getItem('Organization Documents', '/documents/org'),
  ]),

  getItem('Document Requests', 'document-requests', <InboxOutlined />, [
    getItem('Request Document', '/document-requests/create'),
    getItem('Requests I Received', '/document-requests/incoming'),
    getItem('Requests I Sent', '/document-requests/outgoing'),
  ]),

  getItem('Profile', '/profile', <UserOutlined />),
  getItem('My Permissions', '/permissions', <SafetyCertificateOutlined />),
];

/**
 * Get menu items based on user roles
 */
export const getMenuItemsByRole = (roles: string[]): MenuItem[] => {
  if (roles.includes('superadmin')) {
    return superAdminMenuItems;
  } else if (roles.includes('orgadmin')) {
    return orgAdminMenuItems;
  } else if (roles.includes('employee')) {
    return employeeMenuItems;
  }
  return employeeMenuItems; // Default fallback
};

/**
 * Get default route based on user roles
 */
export const getDefaultRoute = (roles: string[]): string => {
  if (roles.includes('superadmin')) {
    return '/superadmin/dashboard';
  } else if (roles.includes('orgadmin')) {
    return '/admin/dashboard';
  } else if (roles.includes('employee')) {
    return '/employee/dashboard';
  }
  return '/employee/dashboard'; // Default fallback
};
