
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Department, JobLevel } from '../types';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  login: (email: string, department: Department, jobLevel: JobLevel, password?: string) => Promise<void>;
  register: (email: string, department: Department, jobLevel: JobLevel, password?: string, fullName?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth State from LocalStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = AuthService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Auth init failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, department: Department, jobLevel: JobLevel, password?: string): Promise<void> => {
    // We let the error propagate so the UI can handle specific cases (e.g. "Email not confirmed")
    const response = await AuthService.login({ email, department, jobLevel, password });
    
    // Store session securely
    localStorage.setItem('lgu_token', response.token);
    localStorage.setItem('lgu_user', JSON.stringify(response.user));
    
    setUser(response.user);
  };

  const register = async (email: string, department: Department, jobLevel: JobLevel, password?: string, fullName?: string): Promise<void> => {
      // We let the error propagate
      await AuthService.register({ email, department, jobLevel, password, fullName });
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    window.location.href = '/login'; // Hard redirect to clear any app state
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
