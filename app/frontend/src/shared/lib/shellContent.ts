/**
 * Contenido editable del "shell" global de la aplicación.
 *
 * Se publica en `site_content` con slug `ui.shell` y lo consume el menú,
 * la barra inferior, el logo y el fondo de todas las vistas. Igual que la
 * landing, si no hay fila activa se usan estos valores.
 *
 * Los campos son seguros por diseño: texto React (escapado), colores hex,
 * URLs http(s) o rutas internas y booleanos. Nunca HTML ni JavaScript.
 */

import {
  isExternalHttpUrl,
  safeBoolean,
  safeHexColor,
  safeLinkValue,
  safeText,
} from './safeValues';

export const SHELL_CONTENT_SLUG = 'ui.shell';

export interface ShellBrand {
  productName: string;
  tagline: string;
  logoImageUrl: string;
  showMark: boolean;
  showWordmark: boolean;
}

export interface ShellAppearance {
  primaryColor: string;
  primaryDarkColor: string;
  primaryLightColor: string;
  accentColor: string;
  headerFrom: string;
  headerVia: string;
  headerTo: string;
  headerTextColor: string;
  pageBackgroundLight: string;
  pageBackgroundDark: string;
  pageTextColor: string;
}

export interface ShellLabels {
  home: string;
  catalog: string;
  orders: string;
  cart: string;
  menu: string;
  logout: string;
  panel: string;
  users: string;
  roles: string;
  permissions: string;
  audit: string;
  stores: string;
  directory: string;
  clients: string;
  myCatalog: string;
  myRoute: string;
  dashboard: string;
  radar: string;
  verifications: string;
  adminTagline: string;
  verifierTagline: string;
  supplierTagline: string;
  driverTagline: string;
  restaurantTagline: string;
}

export interface ShellVisibility {
  showTopNav: boolean;
  showBottomNav: boolean;
  showCart: boolean;
  showLanguage: boolean;
  showTheme: boolean;
  showNotifications: boolean;
  showBrandTagline: boolean;
  showUserChip: boolean;
  showLogout: boolean;
}

export interface ShellNotice {
  enabled: boolean;
  text: string;
  linkLabel: string;
  linkUrl: string;
}

export interface ShellContent {
  brand: ShellBrand;
  appearance: ShellAppearance;
  labels: ShellLabels;
  visibility: ShellVisibility;
  notice: ShellNotice;
}

export const DEFAULT_SHELL_CONTENT: ShellContent = {
  brand: {
    productName: 'Xupply',
    tagline: '',
    logoImageUrl: '',
    showMark: true,
    showWordmark: true,
  },
  appearance: {
    primaryColor: '#0284c7',
    primaryDarkColor: '#0369a1',
    primaryLightColor: '#38bdf8',
    accentColor: '#10b981',
    headerFrom: '#0369a1',
    headerVia: '#0284c7',
    headerTo: '#0369a1',
    headerTextColor: '#ffffff',
    pageBackgroundLight: '#f8fafc',
    pageBackgroundDark: '#0b1120',
    pageTextColor: '#1e293b',
  },
  labels: {
    home: '',
    catalog: '',
    orders: '',
    cart: '',
    menu: '',
    logout: '',
    panel: '',
    users: '',
    roles: '',
    permissions: '',
    audit: '',
    stores: '',
    directory: '',
    clients: '',
    myCatalog: '',
    myRoute: '',
    dashboard: '',
    radar: '',
    verifications: '',
    adminTagline: '',
    verifierTagline: '',
    supplierTagline: '',
    driverTagline: '',
    restaurantTagline: '',
  },
  visibility: {
    showTopNav: true,
    showBottomNav: true,
    showCart: true,
    showLanguage: true,
    showTheme: true,
    showNotifications: true,
    showBrandTagline: true,
    showUserChip: true,
    showLogout: true,
  },
  notice: {
    enabled: false,
    text: '',
    linkLabel: 'Ver más',
    linkUrl: '',
  },
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Etiqueta publicada, o el texto actual de i18n si el técnico la dejó vacía. */
export function shellLabel(
  content: ShellContent,
  key: keyof ShellLabels,
  fallback: string
): string {
  return safeText(content.labels?.[key], '', 80) || fallback;
}

/** Fusiona con defaults y descarta cualquier valor peligroso o malformado. */
export function mergeShellContent(input: unknown): ShellContent {
  const raw = asRecord(input);
  const brand = asRecord(raw.brand);
  const appearance = asRecord(raw.appearance);
  const labels = asRecord(raw.labels);
  const visibility = asRecord(raw.visibility);
  const notice = asRecord(raw.notice);
  const defaults = DEFAULT_SHELL_CONTENT;

  const mergedLabels = { ...defaults.labels } as Record<string, string>;
  (Object.keys(defaults.labels) as (keyof ShellLabels)[]).forEach((key) => {
    mergedLabels[key] = safeText(labels[key], '', 80);
  });

  return {
    brand: {
      productName: safeText(brand.productName, defaults.brand.productName, 60),
      tagline: safeText(brand.tagline, '', 120),
      logoImageUrl: isExternalHttpUrl(brand.logoImageUrl)
        ? (brand.logoImageUrl as string).trim().slice(0, 500)
        : '',
      showMark: safeBoolean(brand.showMark, defaults.brand.showMark),
      showWordmark: safeBoolean(brand.showWordmark, defaults.brand.showWordmark),
    },
    appearance: {
      primaryColor: safeHexColor(appearance.primaryColor, defaults.appearance.primaryColor),
      primaryDarkColor: safeHexColor(appearance.primaryDarkColor, defaults.appearance.primaryDarkColor),
      primaryLightColor: safeHexColor(appearance.primaryLightColor, defaults.appearance.primaryLightColor),
      accentColor: safeHexColor(appearance.accentColor, defaults.appearance.accentColor),
      headerFrom: safeHexColor(appearance.headerFrom, defaults.appearance.headerFrom),
      headerVia: safeHexColor(appearance.headerVia, defaults.appearance.headerVia),
      headerTo: safeHexColor(appearance.headerTo, defaults.appearance.headerTo),
      headerTextColor: safeHexColor(appearance.headerTextColor, defaults.appearance.headerTextColor),
      pageBackgroundLight: safeHexColor(appearance.pageBackgroundLight, defaults.appearance.pageBackgroundLight),
      pageBackgroundDark: safeHexColor(appearance.pageBackgroundDark, defaults.appearance.pageBackgroundDark),
      pageTextColor: safeHexColor(appearance.pageTextColor, defaults.appearance.pageTextColor),
    },
    labels: mergedLabels as unknown as ShellLabels,
    visibility: {
      showTopNav: safeBoolean(visibility.showTopNav, defaults.visibility.showTopNav),
      showBottomNav: safeBoolean(visibility.showBottomNav, defaults.visibility.showBottomNav),
      showCart: safeBoolean(visibility.showCart, defaults.visibility.showCart),
      showLanguage: safeBoolean(visibility.showLanguage, defaults.visibility.showLanguage),
      showTheme: safeBoolean(visibility.showTheme, defaults.visibility.showTheme),
      showNotifications: safeBoolean(visibility.showNotifications, defaults.visibility.showNotifications),
      showBrandTagline: safeBoolean(visibility.showBrandTagline, defaults.visibility.showBrandTagline),
      showUserChip: safeBoolean(visibility.showUserChip, defaults.visibility.showUserChip),
      showLogout: safeBoolean(visibility.showLogout, defaults.visibility.showLogout),
    },
    notice: {
      enabled: safeBoolean(notice.enabled, defaults.notice.enabled),
      text: safeText(notice.text, '', 200),
      linkLabel: safeText(notice.linkLabel, defaults.notice.linkLabel, 40),
      linkUrl: safeLinkValue(notice.linkUrl),
    },
  };
}
