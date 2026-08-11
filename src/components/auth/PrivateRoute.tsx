import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { roleHome, useAuthStore, type UserRole } from '../../store/authStore';

interface PrivateRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <>{children}</>;
}
