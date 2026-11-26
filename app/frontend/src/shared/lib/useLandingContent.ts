import { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  DEFAULT_LANDING_CONTENT,
  mergeLandingContent,
  type LandingContent,
} from './landingContent';

export const LANDING_CONTENT_SLUG = 'landing.content';

interface ContentRow {
  slug: string;
  body: unknown;
  is_active: boolean;
}

/**
 * Trae el bloque `landing.content` publicado por el Técnico.
 * Si no hay API, no hay fila o está desactivado, se quedan los defaults.
 */
export function useLandingContent(): LandingContent {
  const [content, setContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);

  useEffect(() => {
    let alive = true;
    api<ContentRow[]>('/content')
      .then((rows) => {
        if (!alive || !Array.isArray(rows)) return;
        const row = rows.find((item) => item.slug === LANDING_CONTENT_SLUG && item.is_active);
        if (row?.body) setContent(mergeLandingContent(row.body));
      })
      .catch(() => {
        // La landing sigue funcionando con el contenido por defecto.
      });
    return () => {
      alive = false;
    };
  }, []);

  return content;
}
