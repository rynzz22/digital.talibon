
import apiClient from '../lib/axios';
import { User, Department, JobLevel } from '../types';
import { MOCK_USERS } from '../constants';

interface LoginPayload {
  email: string;
  department: Department;
  jobLevel: JobLevel;
  password?: string;
}

interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export const AuthService = {
  /**
   * Authenticates user with the backend.
   * NOTE: For this demo environment, we simulate the API call.
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    // SIMULATED API CALL
    // In production: const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(u => 
          u.email.toLowerCase() === payload.email.toLowerCase() && 
          u.department === payload.department && 
          u.jobLevel === payload.jobLevel
        );

        if (foundUser) {
          const mockResponse: LoginResponse = {
            token: `mock-jwt-token-${Date.now()}`,
            user: foundUser,
            expiresIn: 3600
          };
          resolve(mockResponse);
        } else {
            // Fallback for demo flexibility
            const sessionUser: User = {
                id: `session-${Date.now()}`,
                name: `Officer ${payload.email.split('@')[0]}`,
                email: payload.email,
                department: payload.department,
                jobLevel: payload.jobLevel,
                role: 'STAFF' as any 
            };
            resolve({
                token: `mock-jwt-token-${Date.now()}`,
                user: sessionUser,
                expiresIn: 3600
            });
        }
      }, 800);
    });
  },

  logout: () => {
    // In production: await apiClient.post('/auth/logout');
    localStorage.removeItem('lgu_token');
    localStorage.removeItem('lgu_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('lgu_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
