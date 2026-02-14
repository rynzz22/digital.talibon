import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Department, JobLevel } from '../types';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  login: (email: string, department: Department, jobLevel: JobLevel) => Promise<boolean>;
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

  const login = async (email: string, department: Department, jobLevel: JobLevel): Promise<boolean> => {
    try {
      const response = await AuthService.login({ email, department, jobLevel });
      
      // Store session securely
      localStorage.setItem('lgu_token', response.token);
      localStorage.setItem('lgu_user', JSON.stringify(response.user));
      
      setUser(response.user);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    window.location.href = '/login'; // Hard redirect to clear any app state
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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