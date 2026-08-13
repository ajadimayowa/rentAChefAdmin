import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { roleHome, useAuthStore, type UserRole } from '../../store/authStore';

interface PrivateRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  // The web portal is admin/chef only — customers use the mobile app. This
  // catches any client session already sitting in storage (e.g. from before
  // this guard existed) in addition to the check Login.tsx does up front.
  const isUnauthorizedClient = isAuthenticated && user?.role === 'client';

  useEffect(() => {
    if (isUnauthorizedClient) {
      logout();
      toast.error('Unauthorized user. Please use the Rent a Chef app.');
    }
  }, [isUnauthorizedClient, logout]);

  if (!isAuthenticated || !user || isUnauthorizedClient) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <>{children}</>;
}
