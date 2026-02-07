import { apiGet } from '../apiconfig';

export interface Ciudad {
  idCiudad: number;
  idPais: number;
  nombre: string;
}

/**
 * Obtiene ciudades por país.
 * GET /api/ciudades/porPais?idPais={idPais}
 */
export async function getCiudadesPorPais(idPais: number): Promise<Ciudad[]> {
  const data = await apiGet<Ciudad[]>('ciudades/porPais', { idPais });
  return Array.isArray(data) ? data : [];
}
