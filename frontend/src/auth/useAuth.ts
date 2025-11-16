import { useState, useEffect } from 'react';
import http from '../api/http';

export interface User {
  id?: string;
  email?: string;
  roles?: string[];
}

export const useAuth = () => {
  const token = localStorage.getItem('token');
  const rolesStr = localStorage.getItem('roles');
  const userStr = localStorage.getItem('user');
  const permissionsStr = localStorage.getItem('permissions');

  const roles: string[] = rolesStr ? JSON.parse(rolesStr) : [];
  const user: { id: string; email: string } | null = userStr ? JSON.parse(userStr) : null;
  const [permissions, setPermissions] = useState<string[]>(
    permissionsStr ? JSON.parse(permissionsStr) : []
  );

  const isAuthenticated = !!token;

  // Fetch permissions from backend on mount if authenticated
  useEffect(() => {
    if (token && (!permissionsStr || permissions.length === 0)) {
      http.get('/api/me/permissions')
        .then(response => {
          const perms = response.data as string[];
          setPermissions(perms);
          localStorage.setItem('permissions', JSON.stringify(perms));
        })
        .catch(error => {
          console.error('Failed to fetch permissions:', error);
          // Fallback to role-based permissions if API fails
          const fallbackPerms = getFallbackPermissions(roles);
          setPermissions(fallbackPerms);
        });
    }
  }, [token]);

  const hasRole = (role: string): boolean => roles.includes(role);

  const hasPermission = (perm: string): boolean => {
    if (roles.includes('superadmin')) return true;
    return permissions.includes(perm);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
  };

  return {
    token,
    roles,
    user,
    isAuthenticated,
    hasRole,
    hasPermission,
    permissions,
    logout,
  };
};

/**
 * Fallback permissions based on roles
 * Used only when backend API is unavailable
 */
function getFallbackPermissions(roles: string[]): string[] {
  const rolePermissions: Record<string, string[]> = {
    superadmin: [
      'VIEW_OWN_DOCS',
      'VIEW_ORG_DOCS',
      'VIEW_DEPT_DOCS',
      'UPLOAD_FOR_OTHERS',
      'UPLOAD_OWN_DOCS',
      'REQUEST_DOCS',
    ],
    orgadmin: [
      'VIEW_OWN_DOCS',
      'VIEW_ORG_DOCS',
      'UPLOAD_FOR_OTHERS',
      'UPLOAD_OWN_DOCS',
      'REQUEST_DOCS',
    ],
    employee: [
      'VIEW_OWN_DOCS',
      'UPLOAD_OWN_DOCS',
      'REQUEST_DOCS',
    ],
  };

  return Array.from(
    new Set(roles.flatMap((r) => rolePermissions[r] || []))
  );
}
