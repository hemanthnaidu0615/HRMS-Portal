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
  getItem('Dashboard', '/', <DashboardOutlined />),
  getItem('Organizations', '/superadmin/organizations', <BankOutlined />),
];

/**
 * OrgAdmin Navigation
 */
export const orgAdminMenuItems: MenuItem[] = [
  getItem('Dashboard', '/', <DashboardOutlined />),

  getItem('Employees', 'employees', <TeamOutlined />, [
    getItem('All Employees', '/admin/employees'),
    getItem('Organization Tree', '/admin/employees/tree'),
    getItem('Add Employee', '/orgadmin/create-employee'),
  ]),

  getItem('Structure', 'structure', <ApartmentOutlined />, [
    getItem('Departments', '/admin/structure/departments'),
    getItem('Positions', '/admin/structure/positions'),
  ]),

  getItem('Permissions', 'permissions', <SafetyCertificateOutlined />, [
    getItem('Permission Groups', '/admin/permissions/groups'),
  ]),

  getItem('Documents', 'documents', <FileTextOutlined />, [
    getItem('Organization Documents', '/documents/org'),
    getItem('Document Requests', '/document-requests/org'),
  ]),
];

/**
 * Employee Navigation
 */
export const employeeMenuItems: MenuItem[] = [
  getItem('Dashboard', '/employee/dashboard', <DashboardOutlined />),

  getItem('My Documents', 'my-documents', <FolderOutlined />, [
    getItem('View Documents', '/documents/me'),
    getItem('Upload Document', '/documents/upload'),
  ]),

  getItem('Document Requests', 'document-requests', <InboxOutlined />, [
    getItem('Incoming Requests', '/document-requests/me'),
    getItem('My Requests', '/document-requests/my'),
  ]),

  getItem('Profile', '/profile', <UserOutlined />),
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
    return '/superadmin/organizations';
  } else if (roles.includes('orgadmin')) {
    return '/admin/employees';
  } else if (roles.includes('employee')) {
    return '/employee/dashboard';
  }
  return '/employee/dashboard'; // Default fallback
};
