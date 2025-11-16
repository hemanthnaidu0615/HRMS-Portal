import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getDefaultRoute } from '../config/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { token, roles } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If specific role required but user doesn't have it, redirect to their default route
  // Don't logout authenticated users who access wrong role routes
  if (requiredRole && !roles.includes(requiredRole)) {
    return <Navigate to={getDefaultRoute(roles)} replace />;
  }

  return <>{children}</>;
};
