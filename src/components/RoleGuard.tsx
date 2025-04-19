import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: number[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const verifyPermission = async () => {
      // If already authenticated, check role
      if (isAuthenticated && user) {
        setHasAccess(allowedRoles.includes(user.role));
        setIsChecking(false);
        return;
      }
      
      // Otherwise, try to check auth status
      if (!isLoading) {
        const isAuth = await checkAuthStatus();
        
        // If auth check succeeded and we have a user
        if (isAuth && user) {
          setHasAccess(allowedRoles.includes(user.role));
        } else {
          setHasAccess(false);
        }
        
        setIsChecking(false);
      }
    };
    
    verifyPermission();
  }, [user, isAuthenticated, isLoading, allowedRoles, checkAuthStatus]);

  // Show loading state while checking
  if (isLoading || isChecking) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Redirect if not authenticated or not authorized
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children if authorized
  return <>{children}</>;
};

export default RoleGuard;
