import { apiPost } from '../apiconfig';

export interface VueloCreateInput {
  idVuelo: number;
  aerolinea: string;
  origen: string;
  destino: string;
  fechaSalida: string;
  fechaLlegada: string;
  fechaExtraSalida: string | null;
  fechaExtraLlegada: string | null;
}

export interface Vuelo {
  idVuelo: number;
  aerolinea: string;
  origen: string;
  destino: string;
  fechaSalida: string;
  fechaLlegada: string;
  fechaExtraSalida: string | null;
  fechaExtraLlegada: string | null;
}

/**
 * Crea un vuelo.
 * POST /api/vuelos
 */
export async function createVuelo(input: Omit<VueloCreateInput, 'idVuelo'>): Promise<Vuelo> {
  return apiPost<Vuelo>('vuelos', {
    idVuelo: 0,
    aerolinea: input.aerolinea,
    origen: input.origen,
    destino: input.destino,
    fechaSalida: input.fechaSalida,
    fechaLlegada: input.fechaLlegada,
    fechaExtraSalida: input.fechaExtraSalida ?? null,
    fechaExtraLlegada: input.fechaExtraLlegada ?? null,
  });
}
