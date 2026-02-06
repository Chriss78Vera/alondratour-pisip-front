import { apiGet, apiPost } from '../apiconfig';

export interface HotelReservaCreateInput {
  idReserva: number;
  idHotel: number;
  fechaCheckin: string;
  fechaCheckout: string;
  fechaExtraCheckin: string | null;
  fechaExtraCheckout: string | null;
}

export interface HotelReserva {
  idHotelReserva: number;
  idReserva: number;
  idHotel: number;
  fechaCheckin: string;
  fechaCheckout: string;
  fechaExtraCheckin: string | null;
  fechaExtraCheckout: string | null;
}

/** Hotel anidado en la respuesta de buscarPorIdReserva */
export interface HotelReservaHotel {
  idHotel: number;
  idPaquetesDetalles: number;
  nombre: string;
  precio: number;
  estado?: boolean;
}

/** Item devuelto por GET /api/hoteles-reservas/buscarPorIdReserva */
export interface HotelReservaConDetalles {
  idHotelReserva: number;
  idReserva: number;
  idHotel: number;
  fechaCheckin: string;
  fechaCheckout: string;
  fechaExtraCheckin: string | null;
  fechaExtraCheckout: string | null;
  hotel: HotelReservaHotel;
}

/**
 * Busca hoteles-reserva por id de reserva.
 * GET /api/hoteles-reservas/buscarPorIdReserva?idReserva=
 */
export async function getHotelReservasPorIdReserva(
  idReserva: number
): Promise<HotelReservaConDetalles[]> {
  const data = await apiGet<HotelReservaConDetalles[]>('hoteles-reservas/buscarPorIdReserva', {
    idReserva,
  });
  return Array.isArray(data) ? data : [];
}

/**
 * Crea una reserva de hotel.
 * POST /api/hoteles-reservas
 */
export async function createHotelReserva(
  input: Omit<HotelReservaCreateInput, 'idHotelReserva'>
): Promise<HotelReserva> {
  return apiPost<HotelReserva>('hoteles-reservas', {
    idHotelReserva: 0,
    idReserva: input.idReserva,
    idHotel: input.idHotel,
    fechaCheckin: input.fechaCheckin,
    fechaCheckout: input.fechaCheckout,
    fechaExtraCheckin: input.fechaExtraCheckin,
    fechaExtraCheckout: input.fechaExtraCheckout,
  });
}

/** Body para editar solo fechas extras de un hotel-reserva */
export interface HotelReservaEditarExtrasInput {
  idHotelReserva: number;
  idReserva: number;
  idHotel: number;
  fechaCheckin: string;
  fechaCheckout: string;
  fechaExtraCheckin: string;
  fechaExtraCheckout: string;
}

/**
 * Actualiza las fechas extras de un hotel-reserva.
 * POST /api/hoteles-reservas/editarExtras
 */
export async function editarExtrasHotelReserva(
  input: HotelReservaEditarExtrasInput
): Promise<HotelReserva> {
  return apiPost<HotelReserva>('hoteles-reservas/editarExtras', input);
}
