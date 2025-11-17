import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';

const routeNameMap: Record<string, string> = {
  // SuperAdmin routes
  '/superadmin': 'Super Admin',
  '/superadmin/dashboard': 'Dashboard',
  '/superadmin/organizations': 'Organizations',
  '/superadmin/create-organization': 'Create Organization',

  // OrgAdmin routes
  '/admin': 'Admin',
  '/admin/dashboard': 'Dashboard',
  '/admin/employees': 'Employees',
  '/admin/employees/create': 'Add Employee',
  '/admin/employees/import': 'Import Employees',
  '/admin/employees/tree': 'Organization Chart',
  '/admin/structure': 'Structure',
  '/admin/structure/departments': 'Departments',
  '/admin/structure/departments/new': 'New Department',
  '/admin/structure/positions': 'Positions',
  '/admin/structure/positions/new': 'New Position',
  '/admin/roles': 'Roles',
  '/admin/roles/create': 'Create Role',
  '/admin/permissions': 'Permissions',
  '/admin/permissions/groups': 'Permission Groups',

  // Employee routes
  '/employee': 'Employee',
  '/employee/dashboard': 'Dashboard',

  // Document routes
  '/documents': 'Documents',
  '/documents/me': 'My Documents',
  '/documents/org': 'Organization Documents',
  '/documents/upload': 'Upload Document',
  '/document-requests': 'Document Requests',
  '/document-requests/me': 'Incoming Requests',
  '/document-requests/my': 'My Requests',
  '/document-requests/org': 'Organization Requests',

  // Common routes
  '/profile': 'Profile',
  '/permissions': 'My Permissions',
};

const getDynamicRouteName = (segment: string, fullPath: string): string => {
  // Handle dynamic segments like employee IDs
  if (fullPath.includes('/admin/employees/') && segment.match(/^[a-f0-9-]{36}$/i)) {
    return 'Employee Details';
  }
  if (fullPath.includes('/admin/roles/') && segment === 'edit') {
    return 'Edit Role';
  }
  if (segment === 'assignment') {
    return 'Assignment';
  }
  if (segment === 'history') {
    return 'History';
  }
  if (segment === 'permissions') {
    return 'Permissions';
  }

  return segment;
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  // Don't show breadcrumbs on login or home page
  if (pathSnippets.length === 0 || location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  const breadcrumbItems = [];

  // Add home icon
  breadcrumbItems.push({
    title: (
      <Link to="/">
        <HomeOutlined />
      </Link>
    ),
  });

  // Build breadcrumb items
  pathSnippets.forEach((snippet, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const routeName = routeNameMap[url] || getDynamicRouteName(snippet, location.pathname);

    // Check if this is the last item (current page)
    const isLast = index === pathSnippets.length - 1;

    breadcrumbItems.push({
      title: isLast ? (
        <span style={{ color: '#000', fontWeight: 500 }}>{routeName}</span>
      ) : (
        <Link to={url}>{routeName}</Link>
      ),
    });
  });

  return (
    <div style={{
      padding: '12px 24px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
    }}>
      <Breadcrumb
        items={breadcrumbItems}
        separator="/"
        style={{
          fontSize: 14,
        }}
      />
    </div>
  );
};
