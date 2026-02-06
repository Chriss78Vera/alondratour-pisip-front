import { apiPost } from '../apiconfig';

/** Body de POST /api/hoteles/editar */
export interface HotelEditarBody {
  idHotel: number;
  idPaquetesDetalles: number;
  nombre: string;
  precio: number;
  estado: boolean;
}

/**
 * Actualiza un hotel (nombre, precio, estado).
 * POST /api/hoteles/editar
 */
export async function editarHotel(body: HotelEditarBody): Promise<unknown> {
  return apiPost('hoteles/editar', body);
}
