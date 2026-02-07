import { apiGet } from '../apiconfig';

export interface Pais {
  idPais: number;
  nombre: string;
}

/**
 * Obtiene todos los países.
 * GET /api/paises
 */
export async function getPaises(): Promise<Pais[]> {
  const data = await apiGet<Pais[]>('paises');
  return Array.isArray(data) ? data : [];
}
