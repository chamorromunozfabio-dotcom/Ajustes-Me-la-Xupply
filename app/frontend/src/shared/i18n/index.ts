import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esCommon from './locales/es/common.json';
import enCommon from './locales/en/common.json';
import esCatalog from './locales/es/catalog.json';
import enCatalog from './locales/en/catalog.json';
import esOrders from './locales/es/orders.json';
import enOrders from './locales/en/orders.json';
import esCart from './locales/es/cart.json';
import enCart from './locales/en/cart.json';
import esDirectory from './locales/es/directory.json';
import enDirectory from './locales/en/directory.json';

export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const LANGUAGE_STORAGE_KEY = 'xupply_lang';

function normalizeLanguage(value: string | null | undefined): AppLanguage {
  return value === 'en' ? 'en' : 'es';
}

export function getInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'es';
  return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function persistLanguage(lang: AppLanguage) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

const initialLanguage = getInitialLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    es: { common: esCommon, catalog: esCatalog, orders: esOrders, cart: esCart, directory: esDirectory },
    en: { common: enCommon, catalog: enCatalog, orders: enOrders, cart: enCart, directory: enDirectory },
  },
  lng: initialLanguage,
  fallbackLng: 'es',
  supportedLngs: [...SUPPORTED_LANGUAGES],
  defaultNS: 'common',
  ns: ['common', 'catalog', 'orders', 'cart', 'directory'],
  interpolation: { escapeValue: false },
  returnNull: false,
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

i18n.on('languageChanged', (lng) => {
  persistLanguage(normalizeLanguage(lng));
});

export default i18n;
