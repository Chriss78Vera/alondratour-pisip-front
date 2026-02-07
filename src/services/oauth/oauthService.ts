import axios from 'axios';
import { apiPost } from '../apiconfig';

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
}

export interface LoginTokenRequest {
  tokenAuth: string;
}

export const TOKEN_STORAGE_KEY = 'token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export async function login(correo: string, password: string): Promise<LoginResponse> {
  const body: LoginRequest = { correo, password };

  try {
    const data = await apiPost<LoginResponse>('auth/login', body);
    if (data?.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        (error.response?.status === 401 ? 'Correo o contraseña incorrectos.' : 'Error al iniciar sesión.');
      throw new Error(message);
    }
    throw error instanceof Error ? error : new Error('Error de conexión.');
  }
}

/**
 * Valida el token guardado (p. ej. al recargar la página).
 * POST /api/auth/loginToken
 * Body: { tokenAuth: "..." }
 * El token expira en 1 hora.
 */
export async function loginToken(token: string): Promise<LoginResponse> {
  const body: LoginTokenRequest = { tokenAuth: token };
  try {
    const data = await apiPost<LoginResponse>('auth/loginToken', body);
    if (data?.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    }
    return data;
  } catch (error) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Sesión expirada. Vuelva a iniciar sesión.';
      throw new Error(message);
    }
    throw error instanceof Error ? error : new Error('Error de conexión.');
  }
}

/**
 * Cierra sesión en el servidor y borra el token local.
 * POST /api/auth/logout
 * Body: { tokenAuth: "..." }
 */
export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    try {
      await apiPost('auth/logout', { tokenAuth: token });
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
