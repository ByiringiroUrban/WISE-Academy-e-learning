
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading, user, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAuthentication = async () => {
      if (!isAuthenticated && !isLoading) {
        // Force a check with the server to confirm authentication status
        const isAuth = await checkAuthStatus();
        
        if (!isAuth) {
          console.warn("User not authenticated. Redirecting to:", redirectTo);
          navigate(redirectTo, {
            state: { from: location.pathname },
            replace: true,
          });
        }
      }
      setIsVerifying(false);
    };

    verifyAuthentication();
  }, [isAuthenticated, isLoading, navigate, redirectTo, location, checkAuthStatus]);

  // Return a more comprehensive authentication state
  return {
    user,
    isAuthenticated: !!isAuthenticated,
    isLoading: isLoading || isVerifying,
    verified: !isLoading && !isVerifying && !!isAuthenticated,
  };
}
