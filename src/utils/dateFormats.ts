/**
 * Retorna la fecha en YYYY-MM-DD del día siguiente.
 * Útil para validar mínimos en inputs de fecha (ej. fecha extra después de checkout).
 */
export function addDay(dateStr: string): string {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Suma n días a una fecha en YYYY-MM-DD.
 */
export function addDays(dateStr: string, n: number): string {
  if (!dateStr || n === 0) return dateStr;
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Retorna la fecha de hoy en YYYY-MM-DD.
 * Útil para bloquear fechas pasadas en inputs type="date".
 */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Retorna la fecha actual en formato YYYY-MM-DD.
 * Alias para uso en creación de reservas (fechaReserva).
 */
export function dateToYMD(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
