import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShellContent } from '../context/ShellContext';
import { shellLabel } from '../lib/shellContent';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './NotificationBell';
import { IconCart, IconLogout } from './Icons';
import { useCart } from '../context/CartContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, tenant, logout } = useAuth();
  const shell = useShellContent();
  const label = (key: keyof typeof shell.labels, fallback: string) =>
    shellLabel(shell, key, fallback);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSupplier = user?.role === 'proveedor_admin';
  const isDomiciliario = user?.role === 'domiciliario';
  const isAdmin = user?.role === 'admin';
  const isVerifier = user?.role === 'verificador';
  const isGerente = user?.role === 'gerente';
  const { count: cartCount } = useCart();

  const brandName = tenant && tenant.name && tenant.type !== 'platform'
    ? `${tenant.name} · ${shell.brand.productName}`
    : shell.brand.productName;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition duration-150 x-shell-action ${
      isActive(path)
        ? `x-shell-active ${isSupplier ? 'text-emerald-800' : 'text-brand'} shadow-sm font-bold`
        : 'text-white/90 hover:bg-white/15 hover:text-white'
    }`;

  return (
    <>
      <header
        className={`x-shell-header hidden sm:block sticky top-0 z-30 text-white shadow-md transition-colors duration-300 ${
          isSupplier
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-950 border-b border-emerald-500/30'
            : 'bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 dark:from-slate-900 dark:via-sky-950 dark:to-slate-900 border-b border-sky-500/20'
        }`}
      >
        <div className="x-shell-header__inner mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <Link to="/" className="x-shell-brand flex items-center gap-2 group">
              <span className="x-shell-brand-mark">
                <Logo size={34} showWordmark={false} isSupplier={isSupplier} />
              </span>
              <div className="flex flex-col">
                <span className="x-shell-brand-text text-base font-black tracking-tight leading-none text-white drop-shadow-sm">
                  {brandName}
                </span>
                {shell.visibility.showBrandTagline ? (
                  <span className="x-shell-brand-tagline text-[10px] font-medium tracking-wide mt-0.5 text-white/75">
                    {shell.brand.tagline ||
                      (isAdmin
                        ? label('adminTagline', t('nav.brand_admin'))
                        : isVerifier
                        ? label('verifierTagline', 'Back office · Verificación')
                        : isSupplier
                        ? label('supplierTagline', t('nav.brand_supplier'))
                        : isDomiciliario
                        ? label('driverTagline', t('nav.brand_driver'))
                        : label('restaurantTagline', t('nav.brand_restaurant')))}
                  </span>
                ) : null}
              </div>
            </Link>
          </div>

          {/* Accesos Rápidos Principales (Desktop) */}
          {/* El back office (admin/verificador/tecnico) se maneja solo desde
              el rail lateral de AdminLayout; no duplicamos sus enlaces aquí. */}
          {shell.visibility.showTopNav && !isAdmin && !isVerifier && user?.role !== 'gerente' ? (
            <nav className="x-shell-nav hidden sm:flex items-center gap-1.5 bg-black/15 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            <Link to="/" className={linkClass('/')}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{label('home', t('nav.home'))}</span>
            </Link>

            {!isDomiciliario && !isSupplier && (
              <Link to="/proveedores" className={linkClass('/proveedores')}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{label('directory', t('nav.directory'))}</span>
              </Link>
            )}

            {!isDomiciliario && (
              <Link to="/catalogo" className={linkClass('/catalogo')}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>{isSupplier ? label('myCatalog', t('nav.my_catalog')) : label('catalog', t('nav.market'))}</span>
              </Link>
            )}

            {isDomiciliario && (
              <Link to="/repartidor" className={linkClass('/repartidor')}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <span>{label('myRoute', 'Mi ruta')}</span>
              </Link>
            )}

            <Link to="/pedidos" className={linkClass('/pedidos')}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>{label('orders', t('nav.orders'))}</span>
            </Link>
            {isSupplier && (
              <Link to="/clientes" className={linkClass('/clientes')}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{label('clients', t('nav.clients'))}</span>
              </Link>
            )}
          </nav>
          ) : null}

          {/* Acciones del Lado Derecho */}
          <div className="x-shell-actions flex items-center gap-2 sm:gap-2.5 ml-auto">
            {isGerente && (
              <Link
                to="/mercado/carrito"
                className="x-shell-icon-btn relative shrink-0 flex items-center justify-center h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition border border-white/15 cursor-pointer"
                title={t('nav.cart')}
                aria-label={t('nav.cart')}
              >
                <IconCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black leading-none flex items-center justify-center border border-white/70">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {shell.visibility.showNotifications ? (
              <span className="x-shell-bell-slot"><NotificationBell /></span>
            ) : null}

            {shell.visibility.showUserChip ? (
              <div className="x-shell-user-chip hidden sm:flex items-center gap-2.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 max-w-[220px]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div className="min-w-0 text-right leading-tight">
                  <p className="text-[11px] font-bold truncate text-white">
                    {user?.name || user?.username}
                  </p>
                  <p className="text-[10px] text-white/70 capitalize truncate">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ) : null}

            {shell.visibility.showLogout ? (
              <button
                onClick={handleLogout}
                className="x-shell-icon-btn x-shell-logout shrink-0 flex items-center justify-center h-9 w-9 rounded-xl bg-rose-500/80 hover:bg-rose-600 active:scale-95 text-white transition border border-rose-400/50 cursor-pointer"
                title={t('nav.logout')}
                aria-label={t('nav.logout')}
              >
                <IconLogout className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
