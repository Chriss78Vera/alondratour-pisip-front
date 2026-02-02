export interface Pasajero {
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  pasaporte: boolean;
  visa: boolean;
}

export const pasajeroVacio: Pasajero = {
  nombre: '',
  apellido: '',
  cedula: '',
  fechaNacimiento: '',
  pasaporte: false,
  visa: false,
};
