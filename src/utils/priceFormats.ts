/**
 * Formatea un número como moneda COP (pesos colombianos).
 * Usado en paquetes, hoteles, reservas con precio en COP.
 */
export function formatPrecio(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea un número sin símbolo de moneda (solo dígitos y separadores de miles).
 * Útil para listados y totales donde el contexto ya indica que es costo.
 */
export function formatNumber(value: number, locale = 'es'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
