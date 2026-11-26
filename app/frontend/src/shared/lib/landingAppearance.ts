import type { CSSProperties } from 'react';
import { isExternalHttpUrl } from './safeValues';
import {
  DEFAULT_LANDING_APPEARANCE,
  type LandingContent,
} from './landingContent';

export { isExternalHttpUrl } from './safeValues';

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function hexToRgba(value: string, alpha: number, fallback: string): string {
  const hex = typeof value === 'string' ? value.trim() : '';
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(hex);
  if (!match) return hexToRgba(fallback, alpha, '#0284c7');
  const digits = match[1].length === 3
    ? match[1].split('').map((c) => c + c).join('')
    : match[1];
  const r = parseInt(digits.slice(0, 2), 16);
  const g = parseInt(digits.slice(2, 4), 16);
  const b = parseInt(digits.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

function safeCssUrl(value: string): string {
  if (!isExternalHttpUrl(value)) return '';
  return new URL(value.trim()).href
    .replace(/"/g, '%22')
    .replace(/'/g, '%27')
    .replace(/\\/g, '%5C');
}

/**
 * Convierte la apariencia publicada en variables CSS + fondo.
 * Lo usan la landing pública y la vista previa del editor, para que ambas
 * muestren exactamente lo mismo sin duplicar estilos.
 */
export function getLandingAppearanceStyle(content: LandingContent): CSSProperties {
  const appearance = { ...DEFAULT_LANDING_APPEARANCE, ...(content.appearance ?? {}) };
  const auroraColors = appearance.auroraColors?.length
    ? appearance.auroraColors
    : DEFAULT_LANDING_APPEARANCE.auroraColors;

  const style: Record<string, string | number> = {
    '--bg': appearance.backgroundColor || DEFAULT_LANDING_APPEARANCE.backgroundColor,
    '--brand': appearance.brandColor || DEFAULT_LANDING_APPEARANCE.brandColor,
    '--brand-dark': appearance.brandDarkColor || DEFAULT_LANDING_APPEARANCE.brandDarkColor,
    '--brand-light': appearance.brandLightColor || DEFAULT_LANDING_APPEARANCE.brandLightColor,
    '--emerald': appearance.accentColor || DEFAULT_LANDING_APPEARANCE.accentColor,
    '--text': appearance.textColor || DEFAULT_LANDING_APPEARANCE.textColor,
    '--text-muted': appearance.mutedTextColor || DEFAULT_LANDING_APPEARANCE.mutedTextColor,
    '--aurora-1': auroraColors[0] ?? DEFAULT_LANDING_APPEARANCE.auroraColors[0],
    '--aurora-2': auroraColors[1] ?? DEFAULT_LANDING_APPEARANCE.auroraColors[1],
    '--aurora-3': auroraColors[2] ?? DEFAULT_LANDING_APPEARANCE.auroraColors[2],
    '--aurora-opacity': String(clamp(appearance.auroraOpacity, 0, 100) / 100),
    '--aurora-opacity-2': String(clamp(appearance.auroraOpacity, 0, 100) / 125),
    '--aurora-opacity-3': String(clamp(appearance.auroraOpacity, 0, 100) / 150),
    '--aurora-speed': `${clamp(appearance.auroraSpeed, 4, 90)}s`,
  };

  const background = appearance.backgroundColor || DEFAULT_LANDING_APPEARANCE.backgroundColor;
  const gradient = [
    `radial-gradient(circle at 12% 6%, ${hexToRgba(appearance.brandLightColor, 0.22, DEFAULT_LANDING_APPEARANCE.brandLightColor)}, transparent 38%)`,
    `radial-gradient(circle at 88% 18%, ${hexToRgba(appearance.accentColor, 0.16, DEFAULT_LANDING_APPEARANCE.accentColor)}, transparent 36%)`,
    `radial-gradient(circle at 50% 100%, ${hexToRgba(appearance.brandColor, 0.14, DEFAULT_LANDING_APPEARANCE.brandColor)}, transparent 42%)`,
  ].join(', ');

  if (appearance.backgroundType === 'solid') {
    style.backgroundColor = background;
  } else if (appearance.backgroundType === 'image') {
    const url = safeCssUrl(appearance.backgroundImageUrl);
    if (url) {
      const overlay = hexToRgba(
        appearance.backgroundOverlayColor,
        clamp(appearance.backgroundOverlay, 0, 100) / 100,
        DEFAULT_LANDING_APPEARANCE.backgroundOverlayColor
      );
      style.backgroundImage = `linear-gradient(${overlay}, ${overlay}), url("${url}")`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
      style.backgroundColor = background;
    } else {
      style.backgroundImage = gradient;
      style.backgroundColor = background;
    }
  } else {
    style.backgroundImage = gradient;
    style.backgroundColor = background;
  }

  return style as CSSProperties;
}
