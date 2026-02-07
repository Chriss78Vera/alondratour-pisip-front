import { apiGet, apiPost } from '../apiconfig';

export interface UsuarioInfo {
  cedula: string;
  correo: string;
  idUsuario: number;
  nombre: string;
  rol: string;
  estado?: boolean;
}

/** Usuario tal como lo devuelve GET /api/usuarios o respuesta de crear */
export interface Usuario {
  idUsuario: number;
  nombre: string;
  cedula: string;
  correo: string;
  rol: string;
  idRol?: number;
  estado?: boolean;
}

/** Body para POST /api/usuarios/actualizar */
export interface UsuarioActualizarInput {
  idUsuario: number;
  nombre: string;
  cedula: string;
  correo: string;
  rol?: string;
  idRol?: number;
  password?: string;
  estado: boolean;
}

/**
 * Obtiene la información del usuario a partir del token.
 * GET /api/auth/usuario?tokenAuth=...
 */
export async function getUserInformation(token: string): Promise<UsuarioInfo> {
  return apiGet<UsuarioInfo>('auth/usuario', { tokenAuth: token });
}

/**
 * Lista todos los usuarios.
 * GET /api/usuarios
 */
export async function getUsuarios(): Promise<Usuario[]> {
  const data = await apiGet<Usuario[]>('usuarios');
  return Array.isArray(data) ? data : [];
}

/**
 * Actualiza un usuario (datos y/o contraseña y estado).
 * POST /api/usuarios/actualizar
 */
export async function actualizarUsuario(input: UsuarioActualizarInput): Promise<Usuario> {
  return apiPost<Usuario>('usuarios/actualizar', input);
}

/** Body para crear usuario. POST /api/usuarios */
export interface UsuarioCrearInput {
  idUsuario: number;
  nombre: string;
  cedula: string;
  correo: string;
  idRol: number;
  password: string;
  estado: boolean;
}

/**
 * Crea un usuario. POST /api/usuarios
 */
export async function createUsuario(input: UsuarioCrearInput): Promise<Usuario> {
  return apiPost<Usuario>('usuarios', input);
}
