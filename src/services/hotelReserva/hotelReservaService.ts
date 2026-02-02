import { apiPost } from '../apiconfig';

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
