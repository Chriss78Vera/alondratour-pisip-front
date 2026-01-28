import { apiGet, apiPost } from '../apiconfig';

// Tipos según la respuesta de la API GET /api/paquetes
export interface Hotel {
  idHotel: number;
  idPaquetesDetalles: number;
  nombre: string;
}

export interface PaquetesDetalles {
  idPaquetesDetalles: number;
  fechaInicio: string;
  fechaFin: string;
  precioNeto: number;
}

export interface Paquete {
  idPaquete: number;
  idPaquetesDetalles: number;
  nombre: string;
  descripcion: string;
  pais: string;
  ciudad: string;
  paquetesDetalles: PaquetesDetalles;
  hoteles: Hotel[];
}

/**
 * Obtiene todos los paquetes desde la API.
 * GET /api/paquetes
 */
export async function getAllPaquetes(): Promise<Paquete[]> {
  const data = await apiGet<Paquete[]>('paquetes');
  return Array.isArray(data) ? data : [];
}

// --- Crear paquete en 3 pasos (por relaciones) ---

/** Body y respuesta de POST /api/paquetes-detalles */
export interface PaquetesDetallesCreateInput {
  idPaquetesDetalles: number;
  fechaInicio: string;
  fechaFin: string;
  precioNeto: number;
}

/**
 * Paso 1: Crea paquetes-detalles. Devuelve el idPaquetesDetalles para usar en hoteles y paquete.
 * POST /api/paquetes-detalles
 */
export async function createPaquetesDetalles(
  input: Omit<PaquetesDetallesCreateInput, 'idPaquetesDetalles'>
): Promise<PaquetesDetalles> {
  return apiPost<PaquetesDetalles>('paquetes-detalles', {
    idPaquetesDetalles: 0,
    fechaInicio: input.fechaInicio,
    fechaFin: input.fechaFin,
    precioNeto: input.precioNeto,
  });
}

/** Body de POST /api/hoteles */
export interface HotelCreateInput {
  idHotel: number;
  idPaquetesDetalles: number;
  nombre: string;
}

/**
 * Paso 2: Crea un hotel asociado al idPaquetesDetalles.
 * POST /api/hoteles
 */
export async function createHotel(input: {
  idPaquetesDetalles: number;
  nombre: string;
}): Promise<unknown> {
  return apiPost('hoteles', {
    idHotel: 0,
    idPaquetesDetalles: input.idPaquetesDetalles,
    nombre: input.nombre,
  });
}

/** Body de POST /api/paquetes */
export interface PaqueteCreateInput {
  idPaquete: number;
  idPaquetesDetalles: number;
  nombre: string;
  descripcion: string;
  pais: string;
  ciudad: string;
}

/**
 * Paso 3: Crea el paquete con el idPaquetesDetalles obtenido en el paso 1.
 * POST /api/paquetes
 */
export async function createPaquete(input: Omit<PaqueteCreateInput, 'idPaquete'>): Promise<unknown> {
  return apiPost('paquetes', {
    idPaquete: 0,
    idPaquetesDetalles: input.idPaquetesDetalles,
    nombre: input.nombre,
    descripcion: input.descripcion ?? '',
    pais: input.pais,
    ciudad: input.ciudad,
  });
}
