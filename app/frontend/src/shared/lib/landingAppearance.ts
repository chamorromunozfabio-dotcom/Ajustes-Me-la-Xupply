import type { CSSProperties } from 'react';
import { isExternalHttpUrl, safeHexColor } from './safeValues';
import {
  DEFAULT_LANDING_APPEARANCE,
  type LandingContent,
} from './landingContent';

export { isExternalHttpUrl } from './safeValues';

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Aclara (>0) u oscurece (<0) un hexadecimal ya validado. */
function shiftHexColor(value: string, amount: number, fallback: string): string {
  const hex = safeHexColor(value, fallback);
  const channels = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) + amount;
    return Math.min(255, Math.max(0, channel)).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

/** Texto oscuro sobre fondos claros y blanco sobre fondos oscuros. */
function contrastText(value: string, fallback: string): string {
  const hex = safeHexColor(value, fallback);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#0b1120' : '#ffffff';
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
  const defaults = DEFAULT_LANDING_APPEARANCE;

  // Normalizamos todo color publicado antes de inyectarlo en variables CSS.
  const backgroundColor = safeHexColor(appearance.backgroundColor, defaults.backgroundColor);
  const brandColor = safeHexColor(appearance.brandColor, defaults.brandColor);
  const brandDarkColor = safeHexColor(appearance.brandDarkColor, defaults.brandDarkColor);
  const brandLightColor = safeHexColor(appearance.brandLightColor, defaults.brandLightColor);
  const accentColor = safeHexColor(appearance.accentColor, defaults.accentColor);
  const textColor = safeHexColor(appearance.textColor, defaults.textColor);
  const mutedTextColor = safeHexColor(appearance.mutedTextColor, defaults.mutedTextColor);
  const rawAuroraColors = Array.isArray(appearance.auroraColors) && appearance.auroraColors.length
    ? appearance.auroraColors
    : defaults.auroraColors;
  const auroraColors = rawAuroraColors.map((color, index) =>
    safeHexColor(color, defaults.auroraColors[index] ?? defaults.auroraColors[0])
  );

  const style: Record<string, string | number> = {
    '--bg': backgroundColor,
    '--brand': brandColor,
    '--brand-dark': brandDarkColor,
    '--brand-light': brandLightColor,
    '--emerald': accentColor,
    '--emerald-light': shiftHexColor(accentColor, 48, '#34d399'),
    '--emerald-dark': shiftHexColor(accentColor, -48, '#059669'),
    '--on-brand': contrastText(brandColor, defaults.brandColor),
    '--on-accent': contrastText(accentColor, defaults.accentColor),
    '--panel': hexToRgba(backgroundColor, 0.85, backgroundColor),
    '--panel-soft': hexToRgba(backgroundColor, 0.45, backgroundColor),
    '--panel-solid': backgroundColor,
    '--bg-card': shiftHexColor(backgroundColor, 8, '#0f172a'),
    '--bg-card-hover': shiftHexColor(backgroundColor, 18, '#1e293b'),
    '--text': textColor,
    '--text-muted': mutedTextColor,
    '--aurora-1': auroraColors[0] ?? defaults.auroraColors[0],
    '--aurora-2': auroraColors[1] ?? defaults.auroraColors[1],
    '--aurora-3': auroraColors[2] ?? defaults.auroraColors[2],
    '--aurora-opacity': String(clamp(appearance.auroraOpacity, 0, 100) / 100),
    '--aurora-opacity-2': String(clamp(appearance.auroraOpacity, 0, 100) / 125),
    '--aurora-opacity-3': String(clamp(appearance.auroraOpacity, 0, 100) / 150),
    '--aurora-speed': `${clamp(appearance.auroraSpeed, 4, 90)}s`,
  };

  const gradient = [
    `radial-gradient(circle at 12% 6%, ${hexToRgba(brandLightColor, 0.22, defaults.brandLightColor)}, transparent 38%)`,
    `radial-gradient(circle at 88% 18%, ${hexToRgba(accentColor, 0.16, defaults.accentColor)}, transparent 36%)`,
    `radial-gradient(circle at 50% 100%, ${hexToRgba(brandColor, 0.14, defaults.brandColor)}, transparent 42%)`,
  ].join(', ');

  if (appearance.backgroundType === 'solid') {
    style.backgroundColor = backgroundColor;
  } else if (appearance.backgroundType === 'image') {
    const url = safeCssUrl(appearance.backgroundImageUrl);
    if (url) {
      const overlay = hexToRgba(
        safeHexColor(appearance.backgroundOverlayColor, defaults.backgroundOverlayColor),
        clamp(appearance.backgroundOverlay, 0, 100) / 100,
        defaults.backgroundOverlayColor
      );
      style.backgroundImage = `linear-gradient(${overlay}, ${overlay}), url("${url}")`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
      style.backgroundColor = backgroundColor;
    } else {
      style.backgroundImage = gradient;
      style.backgroundColor = backgroundColor;
    }
  } else {
    style.backgroundImage = gradient;
    style.backgroundColor = backgroundColor;
  }

  return style as CSSProperties;
}
