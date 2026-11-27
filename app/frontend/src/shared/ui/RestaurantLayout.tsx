import { NavLink, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  IconDashboard, IconCatalog, IconOrders, IconInventory,
  IconGps, IconSuppliers, IconInvoice, IconAccounting, IconPlans, IconSettings,
} from './Icons';

function sectionFromPath(pathname: string): string {
  if (pathname.startsWith('/mercado')) return 'mercado';
  if (pathname.startsWith('/gestion') || pathname.startsWith('/comercio') || pathname.startsWith('/administracion')) return 'gestion';
  if (pathname.startsWith('/ajustes')) return 'ajustes';
  return 'inicio';
}

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { t } = useLanguage();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'gerente') return <>{children}</>;

  const tabs = [
    { key: 'inicio', label: t('nav.home'), to: '/', icon: IconDashboard, end: true },
    { key: 'mercado', label: t('nav.market'), to: '/mercado/catalogo', icon: IconCatalog },
    { key: 'gestion', label: t('nav.management'), to: '/gestion/inventario', icon: IconInventory },
    { key: 'ajustes', label: t('nav.settings'), to: '/ajustes', icon: IconSettings },
  ] as const;

  const subnavMap: Record<string, Array<{ to: string; label: string; icon: any }>> = {
    mercado: [
      { to: '/mercado/catalogo', label: t('nav.catalog'), icon: IconCatalog },
      { to: '/mercado/pedidos', label: t('nav.orders'), icon: IconOrders },
      { to: '/mercado/proveedores', label: t('nav.suppliers'), icon: IconSuppliers },
    ],
    gestion: [
      { to: '/gestion/inventario', label: t('nav.inventory'), icon: IconInventory },
      { to: '/gestion/radar', label: t('nav.stock_radar'), icon: IconGps },
      { to: '/gestion/facturacion', label: t('nav.billing'), icon: IconInvoice },
      { to: '/gestion/contabilidad', label: t('nav.accounting'), icon: IconAccounting },
      { to: '/gestion/planes', label: t('nav.plans'), icon: IconPlans },
    ],
  };

  const section = sectionFromPath(pathname);
  const subnav = subnavMap[section];

  return (
    <div className="space-y-4">
      <nav className="x-shell-rail overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5 min-w-max md:min-w-0 md:w-full md:justify-center">
          {tabs.map((tab) => {
            const active = section === tab.key;
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.key}
                to={tab.to}
                end={'end' in tab ? tab.end : undefined}
                className={`x-shell-rail-link flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition whitespace-nowrap ${
                  active
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className={subnav ? 'flex flex-col md:flex-row gap-4' : ''}>
        {subnav && (
          <aside className="w-full md:w-56 shrink-0">
            <div className="x-shell-rail sticky top-36 md:top-32">
              <nav className="x-shell-rail__nav flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0 no-scrollbar">
                {subnav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `x-shell-rail-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition whitespace-nowrap ${
                        isActive
                          ? 'bg-brand text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>
        )}
        <main className={subnav ? 'flex-1 overflow-x-hidden min-h-[400px]' : ''}>
          {children}
        </main>
      </div>
    </div>
  );
}
