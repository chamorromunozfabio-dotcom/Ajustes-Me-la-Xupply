import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShellContent } from '../context/ShellContext';
import { shellLabel } from '../lib/shellContent';
import { useLanguage } from '../context/LanguageContext';
import { Home, Search, ShoppingBag, Menu, Package, Truck, Radar } from 'lucide-react';

export default function BottomNav() {
  const { user } = useAuth();
  const shell = useShellContent();
  const label = (key: keyof typeof shell.labels, fallback: string) =>
    shellLabel(shell, key, fallback);
  const location = useLocation();
  const { t } = useLanguage();

  if (!user || !shell.visibility.showBottomNav) return null;

  const isSupplier = user.role === 'proveedor_admin';
  const isDomiciliario = user.role === 'domiciliario';
  const isAdmin = user.role === 'admin';

  if (isAdmin || user.role === 'verificador') return null; // Admin/back office usan layout de escritorio
  if (user.role === 'gerente') return null; // Gerente usa el shell superior de Restaurante

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItemClass = (path: string) => `
    x-shell-dock__item flex flex-col items-center justify-center py-1.5 gap-0.5 text-[10px] font-semibold transition-colors
    ${isActive(path) ? 'x-shell-active' : ''}
    ${isActive(path)
      ? isSupplier ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'
      : 'text-slate-500 dark:text-slate-400'
    }
  `;

  return (
    <nav className="x-shell-bottomnav x-shell-dock sm:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40">
      <div className="x-shell-dock__inner flex items-center gap-0.5 px-2 py-1">
        <Link to="/" className={navItemClass('/')}>
          <Home className={`w-5 h-5 ${isActive('/') ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span>{label('dashboard', t('nav.dashboard'))}</span>
        </Link>

        {isDomiciliario ? (
          <Link to="/repartidor" className={navItemClass('/repartidor')}>
            <Truck className="w-5 h-5" strokeWidth={isActive('/repartidor') ? 2.5 : 2} />
            <span>{label('myRoute', 'Mi ruta')}</span>
          </Link>
        ) : (
          <Link to="/catalogo" className={navItemClass('/catalogo')}>
            <Search className="w-5 h-5" strokeWidth={isActive('/catalogo') ? 2.5 : 2} />
            <span>{label('catalog', t('nav.catalog'))}</span>
          </Link>
        )}

        {isSupplier && (
          <Link to="/radar" className={navItemClass('/radar')}>
            <Radar className="w-5 h-5" strokeWidth={isActive('/radar') ? 2.5 : 2} />
            <span>{label('radar', 'Radar')}</span>
          </Link>
        )}

        <Link to="/pedidos" className={navItemClass('/pedidos')}>
          <Package className={`w-5 h-5 ${isActive('/pedidos') ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive('/pedidos') ? 2.5 : 2} />
          <span>{label('orders', t('nav.orders'))}</span>
        </Link>



        <Link to="/ajustes" className={navItemClass('/ajustes')}>
          <Menu className="w-5 h-5" strokeWidth={isActive('/ajustes') ? 2.5 : 2} />
          <span>{t('nav.settings')}</span>
        </Link>
      </div>
    </nav>
  );
}
