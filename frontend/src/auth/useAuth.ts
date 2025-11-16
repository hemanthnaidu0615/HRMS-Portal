export interface User {
  id?: string;
  email?: string;
  roles?: string[];
}

export const useAuth = () => {
  const token = localStorage.getItem('token');
  const rolesStr = localStorage.getItem('roles');
  const userStr = localStorage.getItem('user');

  const roles: string[] = rolesStr ? JSON.parse(rolesStr) : [];
  const user: User | null = userStr ? JSON.parse(userStr) : null;

  const isAuthenticated = !!token;

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('user');
  };

  return {
    token,
    roles,
    user: user ? { ...user, roles } : null,
    isAuthenticated,
    hasRole,
    logout,
  };
};
