/** Utilidades comunes para valores publicados por el mini-CMS. */

/** Acepta solo URLs http(s) públicas: el CMS no sube archivos ni acepta otros esquemas. */
export function isExternalHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Acepta rutas internas (`/...`) y URLs http(s), nada de `javascript:` ni `data:`. */
export function isSafeLink(value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim()) return false;
  const text = value.trim();
  return text.startsWith('/') || isExternalHttpUrl(text);
}

/** Normaliza hexadecimal a `#rrggbb`. Cualquier valor inválido usa el fallback. */
export function safeHexColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const hex = value.trim();
  if (/^#[\da-f]{6}$/i.test(hex)) return hex.toLowerCase();
  if (/^#[\da-f]{3}$/i.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toLowerCase();
  }
  return fallback;
}

export function safeText(value: unknown, fallback: string, max = 160): string {
  if (typeof value !== 'string') return fallback;
  const text = value.trim().slice(0, max);
  return text || fallback;
}

export function safeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Devuelve la URL si es segura; si no, cadena vacía. */
export function safeLinkValue(value: unknown, fallback = ''): string {
  return isSafeLink(value) ? (value as string).trim().slice(0, 500) : fallback;
}
