import { apiGet } from '../apiconfig';

export interface UsuarioInfo {
  cedula: string;
  correo: string;
  idUsuario: number;
  nombre: string;
  rol: string;
}

/**
 * Obtiene la información del usuario a partir del token.
 * GET /api/auth/usuario?tokenAuth=...
 */
export async function getUserInformation(token: string): Promise<UsuarioInfo> {
  return apiGet<UsuarioInfo>('auth/usuario', { tokenAuth: token });
}
