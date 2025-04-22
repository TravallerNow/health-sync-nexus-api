
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { AuthResponse } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userId: string | null;
  username: string | null;
  login: (userType: 'patient' | 'doctor' | 'admin', username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');
    
    if (token && role && user) {
      const userData = JSON.parse(user);
      setIsAuthenticated(true);
      setUserRole(role);
      setUserId(userData.userId);
      setUsername(userData.username);
    }
  }, []);

  const login = async (userType: 'patient' | 'doctor' | 'admin', username: string, password: string): Promise<void> => {
    try {
      const response: AuthResponse = await authService.login(userType, { username, password });
      
      authService.saveToken(response.token);
      authService.saveRole(response.role);
      authService.saveUser({
        userId: response.userId,
        username: response.username,
        role: response.role
      });
      
      setIsAuthenticated(true);
      setUserRole(response.role);
      setUserId(response.userId);
      setUsername(response.username);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = (): void => {
    authService.logout();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userId, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
