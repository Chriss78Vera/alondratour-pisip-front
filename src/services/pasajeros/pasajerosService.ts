import { apiPost } from '../apiconfig';

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
