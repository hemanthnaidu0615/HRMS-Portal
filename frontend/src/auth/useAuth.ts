export const useAuth = () => {
  const token = localStorage.getItem('token');
  const rolesStr = localStorage.getItem('roles');
  const userStr = localStorage.getItem('user');
  const roles: string[] = rolesStr ? JSON.parse(rolesStr) : [];
  const user: { id: string; email: string } | null = userStr ? JSON.parse(userStr) : null;

  const isAuthenticated = !!token;

  const hasRole = (role: string): boolean => roles.includes(role);

  // Simple role → permissions mapping for client-side checks
  const rolePermissions: Record<string, string[]> = {
    superadmin: [
      'VIEW_ORG_DOCS',
      'UPLOAD_FOR_OTHERS',
      'UPLOAD_OWN_DOCS',
      'REQUEST_DOCS',
    ],
    orgadmin: [
      'VIEW_ORG_DOCS',
      'UPLOAD_FOR_OTHERS',
      'UPLOAD_OWN_DOCS',
      'REQUEST_DOCS',
    ],
    employee: [
      'UPLOAD_OWN_DOCS',
      'REQUEST_DOCS',
    ],
  };

  const effectivePermissions = Array.from(
    new Set(roles.flatMap((r) => rolePermissions[r] || []))
  );

  const hasPermission = (perm: string): boolean => {
    if (roles.includes('superadmin')) return true;
    return effectivePermissions.includes(perm);
  };

  return {
    token,
    roles,
    user,
    isAuthenticated,
    hasRole,
    hasPermission,
    permissions: effectivePermissions,
  };
};
