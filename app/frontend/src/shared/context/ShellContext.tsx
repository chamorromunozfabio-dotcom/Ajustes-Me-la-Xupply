import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import {
  DEFAULT_SHELL_CONTENT,
  mergeShellContent,
  SHELL_CONTENT_SLUG,
  type ShellContent,
} from '../lib/shellContent';

const ShellContext = createContext<ShellContent>(DEFAULT_SHELL_CONTENT);

interface ContentRow {
  slug: string;
  body: unknown;
  is_active: boolean;
}

/** Carga una sola vez el bloque `ui.shell` publicado por el Técnico. */
export function ShellProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ShellContent>(DEFAULT_SHELL_CONTENT);

  useEffect(() => {
    let alive = true;
    api<ContentRow[]>('/content')
      .then((rows) => {
        if (!alive || !Array.isArray(rows)) return;
        const row = rows.find((item) => item.slug === SHELL_CONTENT_SLUG && item.is_active);
        if (row?.body) setContent(mergeShellContent(row.body));
      })
      .catch(() => {
        // Sin API o sin fila: se mantiene la interfaz original.
      });
    return () => {
      alive = false;
    };
  }, []);

  return <ShellContext.Provider value={content}>{children}</ShellContext.Provider>;
}

export function useShellContent(): ShellContent {
  return useContext(ShellContext);
}
