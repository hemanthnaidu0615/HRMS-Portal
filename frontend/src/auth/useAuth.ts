export const useAuth = () => {
  const token = localStorage.getItem('token');
  const rolesStr = localStorage.getItem('roles');
  const roles: string[] = rolesStr ? JSON.parse(rolesStr) : [];

  const isAuthenticated = !!token;

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  return {
    token,
    roles,
    isAuthenticated,
    hasRole,
  };
};
