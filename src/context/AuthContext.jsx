'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const processingSessionRef = React.useRef(null);
  const sessionProcessedRef = React.useRef(null);

  useEffect(() => {
    // This effect checks for an existing session token
    const initializeAuth = async () => {
      const fetchUserInfo = async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('edu-access-token') : null;
          if (!token) {
            throw new Error('No access token found');
          }
          console.log('Calling getCurrentUser API...');
          const userInfo = await api.getCurrentUser();
          console.log('User info received:', userInfo);
          setUser(userInfo);
          setRole(userInfo.role || null);
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          console.error("Error details:", {
            message: error?.message,
            response: error?.response,
            status: error?.status
          });
          // Clear invalid tokens if fetching fails
          api.clearAuthTokens();
          setUser(null);
          setRole(null);
          setLoading(false);
          throw error;
        }
      };

      // PRIORITY: Check for OAuth callback session ID in URL first
      // This handles the redirect from Google OAuth
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const urlParams = new URL(window.location.href).searchParams;
      const sessionId = urlParams.get('sessionId');
      
      // Check if we're on the callback route
      const isCallbackRoute = window.location.pathname === '/auth/callback' || 
                              window.location.pathname.startsWith('/auth/callback');
      
      // Also check for error parameters
      const errorParam = urlParams.get('error');
      
      console.log('Checking OAuth callback:', {
        pathname: window.location.pathname,
        search: window.location.search,
        hasSessionId: !!sessionId,
        isCallbackRoute,
        error: errorParam
      });
      
      // If there's an error parameter, log it and clear URL
      if (errorParam && !sessionId) {
        console.error('OAuth error received:', errorParam);
        window.history.replaceState({}, document.title, '/');
        setLoading(false);
        return;
      }
      
      // If we have a session ID (OAuth callback), exchange it for tokens
      if (sessionId) {
        // Prevent duplicate processing of the same session ID (React StrictMode causes double execution)
        if (sessionProcessedRef.current === sessionId) {
          console.log('Session ID already processed successfully, skipping duplicate request');
          return;
        }
        
        // Check if another request is already processing this session ID
        if (processingSessionRef.current === sessionId) {
          console.log('Session ID is already being processed, skipping duplicate request');
          return;
        }
        
        // Mark as processing immediately
        processingSessionRef.current = sessionId;
        
        try {
          console.log('OAuth callback detected, exchanging session ID for tokens...');
          console.log('Session ID:', sessionId);
          
          // Exchange session ID for tokens - use Next.js API route
          const API_BASE_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || '/api') : '';
          const sessionUrl = `${API_BASE_URL}/auth/session/${sessionId}`;
          console.log('Fetching from:', sessionUrl);
          
          const response = await fetch(sessionUrl);
          console.log('Session exchange response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('Session exchange failed:', response.status, errorText);
            throw new Error(`Failed to exchange session ID: ${response.status} - ${errorText}`);
          }
          
          const tokenData = await response.json();
          console.log('Tokens received from session exchange:', {
            hasAccessToken: !!tokenData.accessToken,
            hasRefreshToken: !!tokenData.refreshToken,
            accessTokenLength: tokenData.accessToken?.length,
            refreshTokenLength: tokenData.refreshToken?.length
          });
          
          if (!tokenData.accessToken || !tokenData.refreshToken) {
            throw new Error('Invalid token data received from session exchange');
          }
          
          // Store tokens immediately
          api.setAuthTokens(tokenData.accessToken, tokenData.refreshToken);
          console.log('Tokens stored in localStorage');
          
          // Mark as processed immediately after storing tokens (before fetching user info)
          // This prevents other duplicate requests from clearing tokens if they fail
          sessionProcessedRef.current = sessionId;
          
          // Verify tokens were stored
          const storedAccessToken = localStorage.getItem('edu-access-token');
          const storedRefreshToken = localStorage.getItem('edu-refresh-token');
          console.log('Tokens verification:', {
            accessTokenStored: !!storedAccessToken,
            refreshTokenStored: !!storedRefreshToken,
            accessTokenMatch: storedAccessToken === tokenData.accessToken
          });
          
          // Clean up URL - remove query params
          window.history.replaceState({}, document.title, '/');
          
          // Fetch user info from backend using the stored token
          console.log('Fetching user info after OAuth...');
          try {
            const userInfo = await api.getCurrentUser();
            console.log('User info received:', userInfo);
            setUser(userInfo);
            setRole(userInfo.role || null);
            setLoading(false);
            // Clear processing flag
            processingSessionRef.current = null;
            console.log('OAuth callback completed successfully - user logged in');
          } catch (userInfoError) {
            console.error("Failed to fetch user info after storing tokens:", userInfoError);
            console.error("Error details:", {
              message: userInfoError?.message,
              response: userInfoError?.response,
              status: userInfoError?.status
            });
            // Don't clear tokens here - they might be valid but user endpoint might have issues
            // Just set loading to false and let the error be shown
            setLoading(false);
            throw userInfoError;
          }
          return;
        } catch (error) {
          console.error("OAuth callback handling failed:", error);
          console.error("Full error:", JSON.stringify(error, null, 2));
          
          // Check if tokens were already successfully stored by this or another request
          const hasTokens = !!localStorage.getItem('edu-access-token');
          const wasProcessed = sessionProcessedRef.current === sessionId;
          
          console.log('Error recovery check:', {
            hasTokens,
            wasProcessed,
            processingSessionId: processingSessionRef.current,
            sessionId
          });
          
          // Clear processing flag
          processingSessionRef.current = null;
          
          // Only clear tokens if:
          // 1. This session wasn't successfully processed (tokens not stored)
          // 2. No tokens exist in localStorage (meaning another request didn't succeed)
          if (!wasProcessed && !hasTokens) {
            // Clear tokens on error (but they shouldn't exist anyway)
            console.log('Clearing tokens because session exchange failed and no tokens exist');
            api.clearAuthTokens();
            setUser(null);
            setRole(null);
            setLoading(false);
            // Redirect to home/login on error
            window.history.replaceState({}, document.title, '/');
          } else {
            // Tokens were stored successfully, either by this request or another
            // Just try to fetch user info if we have tokens
            console.log('Tokens exist or were processed, attempting to recover...');
            if (hasTokens) {
              try {
                console.log('Attempting to fetch user info with existing tokens...');
                const userInfo = await api.getCurrentUser();
                console.log('User info received after recovery:', userInfo);
                setUser(userInfo);
                setRole(userInfo.role || null);
                setLoading(false);
                console.log('Recovery successful - user logged in');
              } catch (recoveryError) {
                console.error("Recovery failed:", recoveryError);
                // Only now clear tokens if recovery fails
                api.clearAuthTokens();
                setUser(null);
                setRole(null);
                setLoading(false);
              }
            } else {
              // Another request succeeded, just set loading to false
              setLoading(false);
            }
          }
          return;
        }
      } else if (isCallbackRoute) {
        // If we're on callback route but no session ID, something went wrong
        console.warn('On callback route but no session ID found - redirecting to login');
        setLoading(false);
        window.history.replaceState({}, document.title, '/');
        return;
      }

      // If no OAuth callback, check for existing access token
      const storedToken = localStorage.getItem('edu-access-token');
      if (storedToken) {
        try {
          // Fetch user info from backend
          await fetchUserInfo();
        } catch (error) {
          console.error("Auth initialization failed", error);
          // Clear invalid tokens
          api.clearAuthTokens();
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(() => {
    // Redirect to Next.js API route for OAuth
    const API_BASE_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || '/api') : '';
    window.location.href = `${API_BASE_URL}/auth/google`;
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call Next.js API logout endpoint
      const API_BASE_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || '/api') : '';
      const token = typeof window !== 'undefined' ? localStorage.getItem('edu-access-token') : null;
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(() => {
          // Ignore errors on logout
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear tokens and state
      api.clearAuthTokens();
      setUser(null);
      setRole(null);
    }
  }, []);

  const selectRole = useCallback(async (selectedRole) => {
    try {
      const API_BASE_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || '/api') : '';
      const token = typeof window !== 'undefined' ? localStorage.getItem('edu-access-token') : null;
      
      const response = await fetch(`${API_BASE_URL}/users/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to set role';
        let errorData = null;
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Failed to parse error response:', textError);
          }
        }
        
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          ...(errorData ? { errorData } : {})
        };
        
        console.error('Role selection failed:', errorDetails);
        
        // If authentication is required (401) or user not found, clear tokens
        if (response.status === 401 || (errorData && errorData.requiresReauth)) {
          console.log('Clearing tokens due to authentication error');
          api.clearAuthTokens();
          setUser(null);
          setRole(null);
        }
        
        // Create error with more details
        const error = new Error(errorMessage);
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setRole(selectedRole);
    } catch (error) {
      console.error("Failed to set role:", error);
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        response: error?.response
      });
      throw error;
    }
  }, []);

  const updateUserProfile = useCallback(async (updatedData) => {
    if (!user) return;
    try {
        const updatedUser = await api.updateUserProfile(updatedData);
        setUser(updatedUser);
    } catch (error) {
        console.error("Failed to update user profile:", error);
        throw error;
    }
  }, [user]);

  const value = { user, role, loading, login, logout, selectRole, updateUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

