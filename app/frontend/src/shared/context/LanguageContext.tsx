import { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLanguage, persistLanguage } from '../i18n';

export type Language = AppLanguage;

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  setLanguage: (l: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n, t: i18nT } = useTranslation();
  const lang = (i18n.resolvedLanguage === 'en' ? 'en' : 'es') as Language;

  const setLanguage = (newLang: Language) => {
    void i18n.changeLanguage(newLang);
    persistLanguage(newLang);
  };

  const toggleLanguage = () => {
    setLanguage(lang === 'es' ? 'en' : 'es');
  };

  const t = (key: string, fallback?: string): string => {
    const value = i18nT(key, { defaultValue: fallback ?? key });
    return typeof value === 'string' ? value : fallback ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
}
