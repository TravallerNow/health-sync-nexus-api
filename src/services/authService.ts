
import api from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  userId: string;
  username: string;
}

const authService = {
  login: async (userType: 'patient' | 'doctor' | 'admin', credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post(`/authenticate/${userType}`, credentials);
    return response.data;
  },
  
  register: async (userData: RegisterRequest): Promise<any> => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  getCurrentUser: (): any => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  saveToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  saveUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  saveRole: (role: string): void => {
    localStorage.setItem('role', role);
  }
};

export default authService;
