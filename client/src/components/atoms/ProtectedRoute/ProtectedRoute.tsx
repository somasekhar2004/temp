// filename: client/src/components/atoms/ProtectedRoute/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: ('admin' | 'instructor' | 'participant')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If role is specified and user does not match, redirect to main landing
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
export default ProtectedRoute;
