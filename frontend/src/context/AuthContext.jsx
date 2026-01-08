import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, signupApi, changePasswordApi } from '@/lib/api';

const AuthContext = createContext(undefined);

// Mock users for demo
const mockUsers = [];

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { user, token } = await loginApi(email, password);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signup = async (data) => {
    try {
      const { user, token } = await signupApi(data.name, data.email, data.password);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const result = await changePasswordApi(currentPassword, newPassword);
      
      if (result.message) {
        // Success - return success status
        return { success: true };
      } else {
        // Handle specific error cases
        if (result.error?.includes('Not authenticated') || result.error?.includes('Invalid or expired token')) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
          // You might want to redirect to login page
          // window.location.href = '/login';
          return { success: false, error: 'Session expired. Please login again.' };
        }
        
        return { success: false, error: result.error || 'Failed to change password' };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Failed to change password' };
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
