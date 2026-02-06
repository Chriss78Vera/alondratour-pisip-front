import { apiGet, apiPost } from '../apiconfig';

/** Pasajero devuelto por GET /api/pasajeros/buscarPorIdReserva */
export interface PasajeroDetalle {
  idPasajero: number;
  idReserva: number;
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  pasaporte: boolean;
  visa: boolean;
}

/**
 * Busca pasajeros por id de reserva.
 * GET /api/pasajeros/buscarPorIdReserva?idReserva=
 */
export async function getPasajerosPorIdReserva(idReserva: number): Promise<PasajeroDetalle[]> {
  const data = await apiGet<PasajeroDetalle[]>('pasajeros/buscarPorIdReserva', { idReserva });
  return Array.isArray(data) ? data : [];
}

export interface PasajeroCreateInput {
  idPasajero: number;
  idReserva: number;
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  pasaporte: boolean;
  visa: boolean;
}

/**
 * Crea un pasajero asociado a una reserva.
 * POST /api/pasajeros
 */
export async function createPasajero(input: Omit<PasajeroCreateInput, 'idPasajero'>): Promise<unknown> {
  return apiPost('pasajeros', {
    idPasajero: 0,
    idReserva: input.idReserva,
    nombre: input.nombre,
    apellido: input.apellido,
    cedula: input.cedula,
    fechaNacimiento: input.fechaNacimiento,
    pasaporte: input.pasaporte,
    visa: input.visa,
  });
}
