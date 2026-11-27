import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useShellContent } from '../context/ShellContext';
import { useTheme } from '../context/ThemeContext';
import { hasAdminAccess } from '../utils/permissions';
import TermsModal from './TermsModal';
import {
  IconDashboard,
  IconCatalog,
  IconOrders,
  IconCart,
  IconInventory,
  IconGps,
  IconTeam,
  IconSuppliers,
  IconPlans,
  IconAi,
  IconInvoice,
  IconAccounting,
  IconSettings,
  IconBell,
  IconDocument,
  IconSun,
  IconMoon,
  IconGlobe,
} from './Icons';

/** Contenido del antiguo menú hamburguesa, ahora como página de Ajustes. */
export default function AjustesPage() {
  const { user, tenant } = useAuth();
  const { count, openCart } = useCart();
  const shell = useShellContent();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();

  const [termsOpen, setTermsOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(() => localStorage.getItem('pref_sound') !== 'false');
  const [stockAlerts, setStockAlerts] = useState(() => localStorage.getItem('pref_stock') !== 'false');

  const isSupplier = user?.role === 'proveedor_admin';
  const isDomiciliario = user?.role === 'domiciliario';
  const isOwner = user?.role === 'gerente' || isSupplier;
  const isRestaurant = !isSupplier && (!!user?.restaurant_id || user?.role === 'gerente' || user?.role === 'empleado');
  const canTrack = isSupplier || isDomiciliario;
  // El back office ya tiene su rail lateral: no duplicamos sus módulos aquí.
  const showModules = !hasAdminAccess(user);

  const linkClass =
    'flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition text-xs sm:text-sm dark:text-slate-200 dark:hover:bg-slate-800';
  const sectionTitle =
    'text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2';
  const cardClass =
    'rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60';

  return (
    <div className="x-page mx-auto max-w-3xl space-y-5">
      <header className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-sm">
          <IconSettings className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-black leading-tight text-slate-900 dark:text-white">
            {lang === 'es' ? 'Ajustes' : 'Settings'}
          </h1>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400 capitalize">
            {user?.name || user?.username} · {user?.role?.replace('_', ' ')} · {tenant?.name || 'Xupply'}
          </p>
        </div>
      </header>

      {showModules ? (
        <>
          <section className={cardClass}>
            <h2 className={sectionTitle}>{t('nav.main_modules')}</h2>
            <div className="space-y-1">
              <Link to="/" className={linkClass}>
                <span className="flex items-center gap-3">
                  <IconDashboard className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>{t('nav.dashboard')}</span>
                </span>
              </Link>

              {!isDomiciliario && (
                <Link to="/catalogo" className={linkClass}>
                  <span className="flex items-center gap-3">
                    <IconCatalog className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{t('nav.catalog')}</span>
                  </span>
                  <span className="text-[10px] text-brand font-bold bg-brand/10 px-2 py-0.5 rounded-md">B2B</span>
                </Link>
              )}

              {isDomiciliario && (
                <Link to="/repartidor" className={linkClass}>
                  <span className="flex items-center gap-3">
                    <IconGps className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{lang === 'es' ? 'Mi ruta' : 'My route'}</span>
                  </span>
                </Link>
              )}

              <Link to="/pedidos" className={linkClass}>
                <span className="flex items-center gap-3">
                  <IconOrders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('nav.orders')}</span>
                </span>
              </Link>

              {!isSupplier && !isDomiciliario && (
                <button type="button" onClick={openCart} className={`${linkClass} w-full text-left cursor-pointer`}>
                  <span className="flex items-center gap-3">
                    <IconCart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>{t('nav.cart')}</span>
                  </span>
                  {count > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-black text-white">{count}</span>
                  )}
                </button>
              )}
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={sectionTitle}>{t('nav.ops_supply')}</h2>
            <div className="space-y-1">
              {isRestaurant && (
                <Link to="/inventario" className={linkClass}>
                  <span className="flex items-center gap-3">
                    <IconInventory className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{t('nav.inventory')}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">STOCK</span>
                </Link>
              )}

              {canTrack && (
                <Link to="/logistica" className={linkClass}>
                  <span className="flex items-center gap-3">
                    <IconGps className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>{t('nav.deliveries')}</span>
                  </span>
                </Link>
              )}

              {(isRestaurant || isSupplier) && (
                <Link to="/radar" className={linkClass}>
                  <span className="flex items-center gap-3">
                    <IconGps className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>{t('nav.stock_radar')}</span>
                  </span>
                </Link>
              )}

              {isOwner && (
                <Link to="/equipo" className={linkClass}>
                  <span className="flex items-center gap-3">
                    <IconTeam className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>{isSupplier ? t('nav.driver_fleet') : t('nav.staff_team')}</span>
                  </span>
                </Link>
              )}

              <Link to="/proveedores" className={linkClass}>
                <span className="flex items-center gap-3">
                  <IconSuppliers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{t('nav.suppliers')}</span>
                </span>
              </Link>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={sectionTitle}>{t('nav.finance_auto')}</h2>
            <div className="space-y-1">
              {isOwner && !isDomiciliario && (
                <>
                  <Link to="/facturacion" className={linkClass}>
                    <span className="flex items-center gap-3">
                      <IconInvoice className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{t('nav.invoices')}</span>
                    </span>
                  </Link>
                  <Link to="/contabilidad" className={linkClass}>
                    <span className="flex items-center gap-3">
                      <IconAccounting className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('nav.accounting')}</span>
                    </span>
                  </Link>
                </>
              )}

              <Link to="/planes" className={linkClass}>
                <span className="flex items-center gap-3">
                  <IconPlans className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>{t('nav.plans')}</span>
                </span>
              </Link>

              <Link to="/xupply-ia" className={linkClass}>
                <span className="flex items-center gap-3">
                  <IconAi className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{t('nav.ai')}</span>
                </span>
              </Link>
            </div>
          </section>
        </>
      ) : null}

      <section className={cardClass}>
        <h2 className={sectionTitle}>{t('settings.title')}</h2>
        <div className="space-y-1">
          <Link to="/mi-perfil" className={linkClass}>
            <span className="flex items-center gap-3">
              <IconSettings className="w-4 h-4 text-slate-500" />
              <span>{t('settings.profile')}</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setPreferencesOpen(!preferencesOpen)}
            className={`${linkClass} w-full cursor-pointer`}
          >
            <span className="flex items-center gap-3">
              <IconBell className="w-4 h-4 text-slate-500" />
              <span>{t('settings.alerts')}</span>
            </span>
            <span className="text-xs text-slate-400">{preferencesOpen ? '▲' : '▼'}</span>
          </button>

          {preferencesOpen && (
            <div className="space-y-2 rounded-xl bg-slate-50 px-3 py-2.5 pl-9 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span>{lang === 'es' ? 'Alertas sonoras de pedidos' : 'Order sound alerts'}</span>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => {
                    setSoundAlerts(e.target.checked);
                    localStorage.setItem('pref_sound', String(e.target.checked));
                  }}
                  className="rounded text-brand"
                />
              </label>
              {showModules && (
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span>{lang === 'es' ? 'Aviso de stock bajo' : 'Low stock notices'}</span>
                  <input
                    type="checkbox"
                    checked={stockAlerts}
                    onChange={(e) => {
                      setStockAlerts(e.target.checked);
                      localStorage.setItem('pref_stock', String(e.target.checked));
                    }}
                    className="rounded text-brand"
                  />
                </label>
              )}
            </div>
          )}

          <button type="button" onClick={() => setTermsOpen(true)} className={`${linkClass} w-full cursor-pointer`}>
            <span className="flex items-center gap-3">
              <IconDocument className="w-4 h-4 text-slate-500" />
              <span>{t('settings.terms')}</span>
            </span>
          </button>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className={sectionTitle}>{t('nav.access_visuals')}</h2>
        <div className="space-y-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          {shell.visibility.showTheme && (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                {isDarkMode ? <IconMoon className="w-4 h-4 text-indigo-400" /> : <IconSun className="w-4 h-4 text-amber-500" />}
                <span>{isDarkMode ? t('theme.dark') : t('theme.light')}</span>
              </span>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ${
                  isDarkMode ? 'justify-end bg-indigo-600' : 'justify-start bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Alternar modo oscuro"
              >
                <span className="h-4 w-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          )}

          {shell.visibility.showLanguage && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-200/60 pt-2 dark:border-slate-700/50">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                <IconGlobe className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>{t('lang.label')}</span>
              </span>
              <button
                type="button"
                onClick={toggleLanguage}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-2xs transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                {lang === 'es' ? 'ES (Español)' : 'EN (English)'}
              </button>
            </div>
          )}
        </div>
      </section>

      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
}
