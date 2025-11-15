import http from './http';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  email: string;
  roles: string[];
  mustChangePassword: boolean;
}

export interface SetPasswordRequest {
  email: string;
  temporaryPassword: string;
  newPassword: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await http.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  setPassword: async (data: SetPasswordRequest): Promise<{ message: string }> => {
    const response = await http.post('/auth/set-password', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await http.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('user');
  },

  forgotPassword: async (email: string): Promise<void> => {
    await http.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await http.post('/auth/reset-password', { token, newPassword });
  },
};
