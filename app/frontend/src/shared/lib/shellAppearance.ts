import type { CSSProperties } from 'react';
import {
  DEFAULT_SHELL_CONTENT,
  type ShellAppearance,
} from './shellContent';
import { safeHexColor } from './safeValues';

/** Convierte un hex validado a componentes RGB para poder usar alpha en CSS. */
function rgbChannels(hex: string, separator = ', '): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r}${separator}${g}${separator}${b}`;
}

/** Variables CSS publicadas por el editor global. Solo colores validados. */
export function getShellAppearanceVars(
  input?: Partial<ShellAppearance> | null
): Record<string, string> {
  const appearance = { ...DEFAULT_SHELL_CONTENT.appearance, ...(input ?? {}) };
  const color = (key: keyof ShellAppearance) =>
    safeHexColor(appearance[key], DEFAULT_SHELL_CONTENT.appearance[key]);

  const primary = color('primaryColor');
  const primaryDark = color('primaryDarkColor');
  const primaryLight = color('primaryLightColor');
  const accent = color('accentColor');

  return {
    '--shell-primary': primary,
    '--shell-primary-dark': primaryDark,
    '--shell-primary-light': primaryLight,
    '--shell-accent': accent,
    '--shell-header-from': color('headerFrom'),
    '--shell-header-via': color('headerVia'),
    '--shell-header-to': color('headerTo'),
    '--shell-header-text': color('headerTextColor'),
    '--shell-page-light': color('pageBackgroundLight'),
    '--shell-page-dark': color('pageBackgroundDark'),
    '--shell-page-text': color('pageTextColor'),
    // Derivadas: permiten sombras, halos y superficies translúcidas sin nuevos campos.
    '--shell-primary-rgb': rgbChannels(primary),
    '--shell-primary-light-rgb': rgbChannels(primaryLight),
    '--shell-accent-rgb': rgbChannels(accent),
    // Con separador de espacio: las usa Tailwind para `bg-brand/10` y similares.
    '--shell-primary-channels': rgbChannels(primary, ' '),
    '--shell-primary-dark-channels': rgbChannels(primaryDark, ' '),
    '--shell-primary-light-channels': rgbChannels(primaryLight, ' '),
  };
}

/** Para la vista previa del CMS: mismas variables, aplicadas inline. */
export function getShellAppearanceStyle(
  input?: Partial<ShellAppearance> | null
): CSSProperties {
  return getShellAppearanceVars(input) as CSSProperties;
}
