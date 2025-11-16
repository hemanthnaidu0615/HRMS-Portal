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

  /**
   * Check if user has a specific permission
   * Supports both old format (VIEW_OWN_DOCS) and new format (employees:view:own)
   */
  const hasPermission = (perm: string): boolean => {
    // SuperAdmin should NOT have org permissions in new system
    if (roles.includes('superadmin') && !perm.includes(':')) {
      // Old format permissions for backward compatibility
      return false;
    }
    return permissions.includes(perm);
  };

  /**
   * Check if user has permission for a resource:action with ANY of the specified scopes
   * Example: hasPermissionWithAnyScope('employees', 'view', ['team', 'department', 'organization'])
   */
  const hasPermissionWithAnyScope = (resource: string, action: string, scopes: string[]): boolean => {
    return scopes.some(scope => hasPermission(`${resource}:${action}:${scope}`));
  };

  /**
   * Get the highest scope level for a resource:action
   * Returns: 'organization' | 'department' | 'team' | 'own' | null
   */
  const getHighestScope = (resource: string, action: string): string | null => {
    if (hasPermission(`${resource}:${action}:organization`)) return 'organization';
    if (hasPermission(`${resource}:${action}:department`)) return 'department';
    if (hasPermission(`${resource}:${action}:team`)) return 'team';
    if (hasPermission(`${resource}:${action}:own`)) return 'own';
    return null;
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
    hasPermissionWithAnyScope,
    getHighestScope,
    permissions,
    logout,
  };
};

/**
 * Fallback permissions based on roles (new format)
 * Used only when backend API is unavailable
 */
function getFallbackPermissions(roles: string[]): string[] {
  const rolePermissions: Record<string, string[]> = {
    superadmin: [],  // SuperAdmin has NO org permissions
    orgadmin: [
      // Full organization access
      'employees:view:organization',
      'employees:edit:organization',
      'employees:create:organization',
      'documents:view:organization',
      'documents:upload:organization',
      'documents:request:organization',
      'departments:view:organization',
      'departments:create:organization',
      'positions:view:organization',
      'positions:create:organization',
      'roles:view:organization',
      'roles:create:organization',
      'roles:edit:organization',
      'roles:assign:organization',
    ],
    employee: [
      // Basic own access
      'employees:view:own',
      'employees:edit:own',
      'documents:view:own',
      'documents:upload:own',
      'documents:request:organization',
      'leaves:create:own',
      'leaves:view:own',
      'timesheets:submit:own',
      'timesheets:view:own',
      'payroll:view:own',
    ],
  };

  return Array.from(
    new Set(roles.flatMap((r) => rolePermissions[r] || []))
  );
}
