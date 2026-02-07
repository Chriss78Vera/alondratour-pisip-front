/**
 * Expresión regular para validar formato de correo electrónico.
 * Exige: texto + @ + dominio + . + extensión (ej. usuario@dominio.com).
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Valida que una cadena tenga formato de correo electrónico válido.
 * Debe contener @ y al menos un punto (.) para dominio.extensión.
 */
export function isValidEmail(correo: string): boolean {
  if (!correo || typeof correo !== 'string') return false;
  const t = correo.trim();
  if (!t.includes('@') || !t.includes('.')) return false;
  return EMAIL_REGEX.test(t);
}

/** Longitud esperada para cédula (Colombia: 10 dígitos). */
export const CEDULA_LENGTH = 10;

/** Mínimo de dígitos para teléfono/celular. */
export const MIN_PHONE_DIGITS = 9;

/**
 * Valida que la cadena contenga solo dígitos (0-9).
 */
export function isOnlyDigits(value: string): boolean {
  if (value == null || typeof value !== 'string') return false;
  return /^\d+$/.test(value.trim());
}

/**
 * Valida que la cédula tenga exactamente 10 caracteres y solo números.
 */
export function isValidCedula(cedula: string): boolean {
  if (!cedula || typeof cedula !== 'string') return false;
  const t = cedula.trim();
  return t.length === CEDULA_LENGTH && isOnlyDigits(t);
}

/**
 * Valida que el teléfono/celular tenga al menos 9 dígitos y solo números.
 */
export function isValidTelefono(telefono: string): boolean {
  if (telefono == null || typeof telefono !== 'string') return false;
  const digits = telefono.trim().replace(/\D/g, '');
  return digits.length >= MIN_PHONE_DIGITS;
}

/** Longitud mínima para nombre y descripción (paquetes, hoteles). */
export const MIN_TEXT_LENGTH = 3;

/**
 * Valida que un texto tenga al menos la longitud mínima indicada.
 */
export function hasMinLength(text: string, min: number = MIN_TEXT_LENGTH): boolean {
  if (text == null || typeof text !== 'string') return false;
  return text.trim().length >= min;
}

/**
 * Valida que el precio sea mayor que 0 (acepta 0.50, rechaza 0).
 */
export function isPrecioMayorQueCero(value: string | number): boolean {
  const n = typeof value === 'string' ? Number((value || '').toString().replace(/,/g, '.')) : value;
  return !Number.isNaN(n) && n > 0;
}

/**
 * Resultado de validación de fecha de nacimiento.
 */
export type FechaNacimientoResult = {
  valid: boolean;
  error?: string;
  menorDeCinco?: boolean;
};

/**
 * Valida fecha de nacimiento: no futura, no más de 90 años, y si es menor de 5 años no puede viajar en asiento separado.
 * - No puede ser superior a la fecha actual (no futura).
 * - No puede ser más de 90 años atrás.
 * - Si tiene menos de 5 años: invalid y mensaje "niño menor de 5 años no puede viajar en un asiento separado".
 */
export function isValidFechaNacimiento(fecha: string): FechaNacimientoResult {
  if (!fecha || typeof fecha !== 'string' || fecha.trim() === '') {
    return { valid: false, error: 'La fecha de nacimiento es obligatoria.' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birth = new Date(fecha.trim());
  if (Number.isNaN(birth.getTime())) {
    return { valid: false, error: 'Fecha de nacimiento no válida.' };
  }
  birth.setHours(0, 0, 0, 0);
  if (birth > today) {
    return { valid: false, error: 'La fecha de nacimiento no puede ser superior a la fecha actual.' };
  }
  const diffMs = today.getTime() - birth.getTime();
  const ageYears = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
  if (ageYears > 90) {
    return { valid: false, error: 'La fecha de nacimiento no puede ser mayor a 90 años.' };
  }
  if (ageYears < 5) {
    return {
      valid: false,
      menorDeCinco: true,
      error: 'Niño menor de 5 años no puede viajar en un asiento separado.',
    };
  }
  return { valid: true };
}

/** Indica bajo qué campo mostrar el error de validación de fechas de vuelo */
export type FechasVueloErrorField = 'salida' | 'llegada';

/**
 * Valida fechas de vuelo:
 * - Fecha de salida: >= hoy, <= fechaFinPaquete (si se indica).
 * - Fecha de llegada: > fecha de salida, <= fechaFinPaquete (si se indica).
 * Devuelve `field` para mostrar el error bajo el campo correcto.
 */
export function isValidFechasVuelo(
  fechaSalida: string,
  fechaLlegada: string,
  fechaFinPaquete?: string
): { valid: boolean; error?: string; field?: FechasVueloErrorField } {
  if (!fechaSalida || !fechaLlegada) {
    return { valid: false, error: 'Las fechas de salida y llegada son obligatorias.', field: 'salida' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const salida = parseDateOnly(fechaSalida);
  const llegada = parseDateOnly(fechaLlegada);
  if (!salida || !llegada) {
    return { valid: false, error: 'Fechas no válidas.', field: 'salida' };
  }
  if (salida < today) {
    return { valid: false, error: 'La fecha de salida no puede ser anterior a la fecha actual.', field: 'salida' };
  }
  if (llegada <= salida) {
    return { valid: false, error: 'La fecha de llegada debe ser posterior a la fecha de salida.', field: 'llegada' };
  }
  if (fechaFinPaquete) {
    const finPaquete = parseDateOnly(fechaFinPaquete);
    if (finPaquete) {
      if (salida > finPaquete) {
        return { valid: false, error: 'La fecha de salida no puede ser superior a la fecha final del paquete.', field: 'salida' };
      }
      if (llegada > finPaquete) {
        return { valid: false, error: 'La fecha de llegada no puede ser superior a la fecha final del paquete.', field: 'llegada' };
      }
    }
  }
  return { valid: true };
}

/**
 * Valida fechas de check-in y check-out de un hotel en una reserva:
 * - Check-in: >= hoy, dentro del rango [fechaInicioPaquete, fechaFinPaquete].
 * - Check-out: > check-in, >= hoy, dentro del rango del paquete.
 */
export function isValidFechasHotelReserva(
  fechaCheckin: string,
  fechaCheckout: string,
  fechaInicioPaquete: string,
  fechaFinPaquete: string
): { valid: boolean; error?: string; field?: 'checkin' | 'checkout' } {
  if (!fechaCheckin || !fechaCheckout) {
    return { valid: false, error: 'Las fechas de check-in y check-out son obligatorias.', field: 'checkin' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkin = parseDateOnly(fechaCheckin);
  const checkout = parseDateOnly(fechaCheckout);
  const inicio = parseDateOnly(fechaInicioPaquete);
  const fin = parseDateOnly(fechaFinPaquete);
  if (!checkin || !checkout) {
    return { valid: false, error: 'Fechas no válidas.', field: 'checkin' };
  }
  if (!inicio || !fin) {
    return { valid: false, error: 'Rango del paquete no válido.', field: 'checkin' };
  }
  if (checkin < today) {
    return { valid: false, error: 'La fecha de check-in no puede ser anterior a la fecha actual.', field: 'checkin' };
  }
  if (checkin < inicio || checkin > fin) {
    return { valid: false, error: 'La fecha de check-in debe estar dentro del rango del paquete.', field: 'checkin' };
  }
  if (checkout <= checkin) {
    return { valid: false, error: 'La fecha de check-out debe ser posterior a la fecha de check-in.', field: 'checkout' };
  }
  if (checkout < today) {
    return { valid: false, error: 'La fecha de check-out no puede ser anterior a la fecha actual.', field: 'checkout' };
  }
  if (checkout < inicio || checkout > fin) {
    return { valid: false, error: 'La fecha de check-out debe estar dentro del rango del paquete.', field: 'checkout' };
  }
  return { valid: true };
}

/**
 * Parsea una fecha en formato YYYY-MM-DD a Date a medianoche en hora local (evita problemas de zona horaria).
 */
function parseDateOnly(isoDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const month = parseInt(m, 10) - 1;
  const day = parseInt(d, 10);
  const year = parseInt(y, 10);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
}
