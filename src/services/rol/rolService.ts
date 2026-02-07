import { apiGet } from '../apiconfig';

export interface Rol {
  idRol: number;
  tipo: string;
}

/**
 * Obtiene todos los roles.
 * GET /api/roles
 */
export async function getRoles(): Promise<Rol[]> {
  const data = await apiGet<Rol[]>('roles');
  return Array.isArray(data) ? data : [];
}
