/**
 * Recorta un texto a un máximo de caracteres y añade "..." si se excede.
 * Si el texto es undefined o solo espacios, retorna "—".
 */
export function truncate(text: string | undefined, max: number): string {
  if (!text || !text.trim()) return '—';
  const t = text.trim();
  return t.length > max ? t.slice(0, max) + '...' : t;
}
