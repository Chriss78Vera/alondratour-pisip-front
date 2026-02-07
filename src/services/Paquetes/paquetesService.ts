import { apiGet, apiPost } from '../apiconfig';

// Tipos según la respuesta de la API GET /api/paquetes
export interface Hotel {
  idHotel: number;
  idPaquetesDetalles: number;
  nombre: string;
  precio: number;
  estado?: boolean;
}

/** Fechas del paquete (el precio va en cada hotel). No incluye hoteles. */
export interface PaquetesDetalles {
  idPaquetesDetalles: number;
  fechaInicio: string;
  fechaFin: string;
}

/** Paquete general: tiene paquetesDetalles y hoteles a nivel paquete. estado lo devuelve la API. */
export interface Paquete {
  idPaquete: number;
  idPaquetesDetalles: number;
  nombre: string;
  descripcion: string;
  pais: string;
  ciudad: string;
  estado?: boolean;
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

/** Respuesta de GET /api/paquetes/paisesYCiudadesDistintos (formato anterior) */
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

/** Ciudad dentro de un país (para reservas) */
export interface CiudadDestino {
  idCiudad: number;
  nombre: string;
}

/** País con sus ciudades (respuesta del servicio de destinos para reservas) */
export interface PaisConCiudades {
  idPais: number;
  pais: string;
  ciudades: CiudadDestino[];
}

/**
 * Obtiene países con sus ciudades para el paso de destino en reservas.
 * GET /api/paquetes/paisesYCiudadesDistintos (respuesta: array de PaisConCiudades)
 */
export async function getPaisesConCiudades(): Promise<PaisConCiudades[]> {
  const data = await apiGet<PaisConCiudades[]>('paquetes/paisesYCiudadesDistintos');
  return Array.isArray(data) ? data : [];
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
 * Busca paquetes por id de país e id de ciudad.
 * GET /api/paquetes/buscarPorPaisYCiudad?idPais={idPais}&idCiudad={idCiudad}
 */
export async function buscarPaquetesPorPaisYCiudad(
  idPais: number,
  idCiudad: number
): Promise<PaqueteResumen[]> {
  const data = await apiGet<PaqueteResumen[]>('paquetes/buscarPorPaisYCiudad', {
    idPais,
    idCiudad,
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
    estado: true,
  });
}

/** Body de POST /api/paquetes */
export interface PaqueteCreateInput {
  idPaquete: number;
  idPaquetesDetalles: number;
  nombre: string;
  descripcion: string;
  idPais: number;
  idCiudad: number;
  estado: boolean;
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
    idPais: input.idPais,
    idCiudad: input.idCiudad,
    estado: input.estado ?? true,
  });
}

/** Body de POST /api/paquetes/editar */
export interface PaqueteEditarBody {
  idPaquete: number;
  idPaquetesDetalles: number;
  nombre: string;
  descripcion: string;
  pais: string;
  ciudad: string;
  estado: boolean;
}

/**
 * Edita un paquete (nombre, descripción, estado).
 * POST /api/paquetes/editar
 */
export async function editarPaquete(body: PaqueteEditarBody): Promise<unknown> {
  return apiPost('paquetes/editar', body);
}
