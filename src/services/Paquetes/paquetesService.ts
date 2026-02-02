import { apiGet, apiPost } from '../apiconfig';

// Tipos según la respuesta de la API GET /api/paquetes
export interface Hotel {
  idHotel: number;
  idPaquetesDetalles: number;
  nombre: string;
  precio: number;
}

/** Fechas del paquete (el precio va en cada hotel). No incluye hoteles. */
export interface PaquetesDetalles {
  idPaquetesDetalles: number;
  fechaInicio: string;
  fechaFin: string;
}

/** Paquete general: tiene paquetesDetalles y hoteles a nivel paquete */
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

/** Respuesta de GET /api/paquetes/paisesYCiudadesDistintos */
export interface PaisesYCiudadesDistintosResponse {
  paises: string[];
  ciudades: string[];
}

/**
 * Obtiene listas distintas de países y ciudades para selectores.
 * GET /api/paquetes/paisesYCiudadesDistintos
 */
export async function getPaisesYCiudadesDistintos(): Promise<PaisesYCiudadesDistintosResponse> {
  const data = await apiGet<PaisesYCiudadesDistintosResponse>('paquetes/paisesYCiudadesDistintos');
  return {
    paises: Array.isArray(data?.paises) ? data.paises : [],
    ciudades: Array.isArray(data?.ciudades) ? data.ciudades : [],
  };
}

/**
 * Item devuelto por GET /api/paquetes/buscarPorPaisYCiudad.
 * hoteles va en el paquete general, no en paquetesDetalles.
 */
export interface PaqueteResumen {
  idPaquete: number;
  idPaquetesDetalles: number;
  nombre: string;
  descripcion: string;
  pais: string;
  ciudad: string;
  paquetesDetalles?: PaquetesDetalles;
  hoteles?: Hotel[];
}

/**
 * Busca paquetes por país y ciudad para el selector de paquetes.
 * GET /api/paquetes/buscarPorPaisYCiudad
 */
export async function buscarPaquetesPorPaisYCiudad(
  pais: string,
  ciudad: string
): Promise<PaqueteResumen[]> {
  const data = await apiGet<PaqueteResumen[]>('paquetes/buscarPorPaisYCiudad', {
    pais,
    ciudad,
  });
  return Array.isArray(data) ? data : [];
}

// --- Crear paquete en 3 pasos (por relaciones) ---

/** Body de POST /api/paquetes-detalles (ya no incluye precio; el precio va en cada hotel) */
export interface PaquetesDetallesCreateInput {
  idPaquetesDetalles: number;
  fechaInicio: string;
  fechaFin: string;
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
  });
}

/** Body de POST /api/hoteles (cada hotel tiene su precio) */
export interface HotelCreateInput {
  idHotel: number;
  idPaquetesDetalles: number;
  nombre: string;
  precio: number;
}

/**
 * Paso 2: Crea un hotel asociado al idPaquetesDetalles con nombre y precio.
 * POST /api/hoteles
 */
export async function createHotel(input: {
  idPaquetesDetalles: number;
  nombre: string;
  precio: number;
}): Promise<unknown> {
  return apiPost('hoteles', {
    idHotel: 0,
    idPaquetesDetalles: input.idPaquetesDetalles,
    nombre: input.nombre,
    precio: input.precio,
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
