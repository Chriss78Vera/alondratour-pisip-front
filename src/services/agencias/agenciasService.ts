import { apiGet, apiPost } from '../apiconfig';

export interface AgenciaCreateInput {
  idAgencia: number;
  nombre: string;
  telefono: string;
  email: string;
}

export interface Agencia {
  idAgencia: number;
  nombre: string;
  telefono: string;
  email: string;
}

/**
 * Lista todas las agencias.
 * GET /api/agencias
 */
export async function getAgencias(): Promise<Agencia[]> {
  const data = await apiGet<Agencia[]>('agencias');
  return Array.isArray(data) ? data : [];
}

/**
 * Crea una agencia.
 * POST /api/agencias
 */
export async function createAgencia(input: Omit<AgenciaCreateInput, 'idAgencia'>): Promise<Agencia> {
  return apiPost<Agencia>('agencias', {
    idAgencia: 0,
    nombre: input.nombre,
    telefono: input.telefono,
    email: input.email,
  });
}
