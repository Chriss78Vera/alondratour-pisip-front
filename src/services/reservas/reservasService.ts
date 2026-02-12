import { apiGet, apiPost } from '../apiconfig';

/** Agencia anidada en la respuesta GET /api/reservas */
export interface ReservaAgencia {
  idAgencia: number;
  nombre: string;
  email: string;
  telefono: string;
}

/** Hotel en contexto de reserva (puede incluir fechas extra) */
export interface ReservaPaqueteHotel {
  idHotel: number;
  nombre: string;
  precio?: number;
  fechaExtraChecking?: string | null;
  fechaExtraCheckout?: string | null;
}

/** Paquete anidado en la respuesta GET /api/reservas */
export interface ReservaPaquete {
  idPaquete: number;
  idPaquetesDetalles: number;
  idPais: number;
  idCiudad: number;
  nombre: string;
  descripcion: string;
  nombrePais: string;
  nombreCiudad: string;
  estado?: boolean;
  hoteles?: ReservaPaqueteHotel[];
}

/** Vuelo anidado en la respuesta GET /api/reservas */
export interface ReservaVuelo {
  idVuelo: number;
  aerolinea: string;
  idPaisDestino: number;
  idCiudadDestino: number;
  nombrePaisDestino: string;
  nombreCiudadDestino: string;
  fechaSalida: string;
  fechaLlegada: string;
  fechaExtraSalida: string | null;
  fechaExtraLlegada: string | null;
}

/** Item devuelto por GET /api/reservas (listado con detalles) */
export interface ReservaConDetalles {
  idReserva: number;
  idUsuario: number;
  fechaReserva: string;
  costoTotal: number;
  estado: boolean;
  agencia: ReservaAgencia;
  paquete: ReservaPaquete;
  vuelo: ReservaVuelo;
}

/**
 * Lista todas las reservas.
 * GET /api/reservas
 */
export async function getReservas(): Promise<ReservaConDetalles[]> {
  const data = await apiGet<ReservaConDetalles[]>('reservas');
  return Array.isArray(data) ? data : [];
}

export interface ReservaCreateInput {
  idReserva: number;
  idUsuario: number;
  idVuelo: number;
  idPaquete: number;
  idAgencia: number;
  fechaReserva: string;
  costoTotal: number;
  estado: boolean;
}

export interface Reserva {
  idReserva: number;
  idUsuario: number;
  idVuelo: number;
  idPaquete: number;
  idAgencia: number;
  fechaReserva: string;
  costoTotal: number;
  estado: boolean;
}

/**
 * Crea una reserva.
 * POST /api/reservas
 */
export async function createReserva(input: Omit<ReservaCreateInput, 'idReserva'>): Promise<Reserva> {
  return apiPost<Reserva>('reservas', {
    idReserva: 0,
    idUsuario: input.idUsuario,
    idVuelo: input.idVuelo,
    idPaquete: input.idPaquete,
    idAgencia: input.idAgencia,
    fechaReserva: input.fechaReserva,
    costoTotal: input.costoTotal,
    estado: input.estado,
  });
}

/** Body para POST /api/reservas/desactivar (cancelar reserva) */
export interface ReservaDesactivarInput {
  idReserva: number;
  idUsuario: number;
  idVuelo: number;
  idPaquete: number;
  idAgencia: number;
  fechaReserva: string;
  costoTotal: number;
  estado: false;
}

/**
 * Cancela una reserva (estado = false).
 * POST /api/reservas/desactivar
 */
export async function desactivarReserva(input: ReservaDesactivarInput): Promise<Reserva> {
  return apiPost<Reserva>('reservas/desactivar', { ...input, estado: false });
}
