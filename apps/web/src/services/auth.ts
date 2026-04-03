import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'https://amee-unforestalled-synodically.ngrok-free.dev';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  expiresIn: number;
  user: AdminUser;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function adminLogin(
  data: AdminLoginRequest,
): Promise<AdminLoginResponse> {
  const response = await api.post<AdminLoginResponse>(
    '/admin/auth/login',
    data,
  );
  return response.data;
}

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('admin_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function authJsonHeaders(): Record<string, string> {
  return {
    ...authHeaders(),
    'Content-Type': 'application/json',
  };
}

export { api, API_BASE_URL };