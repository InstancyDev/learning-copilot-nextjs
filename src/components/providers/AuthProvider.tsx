'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { ApiService, fetchSiteConfigurations } from '@/services/api.service';
import type { UserContext } from '@/types';
import { sessionUtils, userUtils } from '@/utils/auth';
import { API_CONFIG } from '@/config/api.config';
import { LoginScreen } from '@/components/auth/LoginScreen';

// Create authentication context
interface AuthContextType {
  user: UserContext | null;
  loading: boolean;
  error: string | null;
  login: (userContext: UserContext) => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const [siteConfigLoaded, setSiteConfigLoaded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for session data and redirect if not found
  useEffect(() => {
    const checkSessionAndRedirect = () => {
      if (typeof window === 'undefined') return;

      const sessionKey = `userContext_${window.location.origin}`;
      const sessionData = sessionStorage.getItem(sessionKey);
      const hasAuthKey = searchParams.get('authKey');
      
      // Check if session data is empty, null, or undefined
      const isSessionEmpty = !sessionData || sessionData === 'null' || sessionData === 'undefined' || sessionData.trim() === '';
      
      // Only redirect if there's no authKey AND session is empty/null/undefined
      if (!hasAuthKey && isSessionEmpty) {
        console.log('No authKey in URL and no session data found, redirecting to LogOutURL');
        console.log('Session key:', sessionKey);
        console.log('Session data:', sessionData);
        console.log('Has authKey:', !!hasAuthKey);
        window.location.href = API_CONFIG.LogOutURL;
        return;
      }
      
      // If we have either authKey or valid session data, continue
      console.log('Session check passed - continuing with app initialization');
      console.log('Session key:', sessionKey);
      console.log('Session data exists:', !!sessionData);
      console.log('Has authKey:', !!hasAuthKey);
    };

    // Only check session if we haven't attempted authentication yet
    if (!authAttempted) {
      checkSessionAndRedirect();
    }
  }, [authAttempted, searchParams]);

  // Initialize user from URL authKey or existing session
  useEffect(() => {
    const authenticate = async () => {
      try {
        setLoading(true);
        setError(null);

        const encodedAuthKey = searchParams.get('authKey'); 
        if (encodedAuthKey) {
          try {
            sessionStorage.removeItem('tavus_conversation');
            //const authKey = JSON.parse(atob(decodeURIComponent(encodedAuthKey)));
            const authKey = atob(decodeURIComponent(encodedAuthKey));
            // Use the new authentication method that matches the converted Angular logic
            const { user: authenticatedUser, siteDetails, siteKeyParams } = await ApiService.auth.authenticateWithSiteMetadata(authKey);
            
            // Save authenticated user to session
            sessionUtils.saveUserToSession(authenticatedUser);
            setUser(authenticatedUser);
            
            // Store site parameters for use in login process
            if (siteKeyParams && typeof window !== 'undefined') {
              sessionStorage.setItem('siteParams', JSON.stringify(siteKeyParams));
            }
            
            console.log('User authenticated successfully:', userUtils.getDisplayName(authenticatedUser));
            console.log('Site details:', siteDetails);
            console.log('Site key parameters:', siteKeyParams);

            // Fetch site configurations after authentication
            await fetchSiteConfigurations();
            setSiteConfigLoaded(true);

            if (typeof window !== 'undefined') {
              //router.push('/ai-agent');
              router.push('/');
            }
            
          } catch (authError: any) {
            console.error('Authentication error:', authError);
            setError('Invalid or expired authentication key. Please contact your administrator.');
            setSiteConfigLoaded(true); // allow app to proceed even if config fails
          } finally {
            setLoading(false);
          }
        } else {
          const sessionUser = sessionUtils.getUserFromSession();
          if (sessionUser) {
            setUser(sessionUser);
            console.log('User restored from session:', userUtils.getDisplayName(sessionUser));
            // Fetch site configurations after restoring session
            await fetchSiteConfigurations();
            setSiteConfigLoaded(true);
          } else {
            setSiteConfigLoaded(true); // allow app to proceed to login screen
          }
          setLoading(false);
        }
        setAuthAttempted(true);
      } catch (error) {
        console.error('Error initializing user:', error);
        setError('An unexpected error occurred during initialization.');
        setLoading(false);
        setSiteConfigLoaded(true);
      }
    };

    authenticate();
  }, [router, searchParams]);

  const handleLogin = (userContext: UserContext) => {
    sessionUtils.saveUserToSession(userContext);
    setUser(userContext);
    setError(null);
    console.log('User logged in successfully:', userUtils.getDisplayName(userContext));
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await ApiService.auth.logout();
      }
      sessionUtils.clearUserSession();
      setUser(null);
      setError(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Failed to logout properly. Please refresh the page.');
    }
  };

  const clearError = () => {
    setError(null);
  };

  if (loading || !siteConfigLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Learning Portal</h2>
          <p className="text-gray-600">
            {user ? `Welcome back, ${userUtils.getDisplayName(user)}!` : 'Initializing application...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={clearError}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user && authAttempted) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login: handleLogin, logout: handleLogout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}; 
