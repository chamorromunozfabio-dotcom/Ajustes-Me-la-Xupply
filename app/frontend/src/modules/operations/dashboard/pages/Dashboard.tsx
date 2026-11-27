import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Info, Menu, RefreshCw } from 'lucide-react';
import './Dashboard.css';
import { api } from '../../../../shared/api/client';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useCart } from '../../../../shared/context/CartContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { Order, Product } from '../../../../shared/types';
import { ORDER_STATUS, formatMoney, formatDate } from '../../../../shared/utils/constants';
import RecommendedSuppliersGallery from '../../../../shared/ui/RecommendedSuppliersGallery';
import AppDownloadNotice from '../../../../shared/ui/AppDownloadNotice';
import {
  IconMotorcycle,
  IconChart,
  IconGps,
  IconOrders,
  IconAi,
  IconKey,
  IconBox,
  IconInventory,
  IconTeam,
  IconSuppliers,
  IconPlans,
  IconMessage,
} from '../../../../shared/ui/Icons';

interface MonthlyItem {
  month_key: string;
  month_name: string;
  orders_count: number;
  total_amount: number;
}

interface StockAlert {
  id: number;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  stock_status: string;
  supplier_name: string;
  supplier_id?: number;
}

interface SuggestionItem {
  id: number;
  name: string;
  unit: string;
  price_per_unit: number;
  supplier_id: number;
  supplier_name: string;
  image_url?: string;
  reason: string;
}

interface DiscountItem {
  id: number;
  name: string;
  unit: string;
  price_per_unit: number;
  original_price: number;
  discount_pct: number;
  supplier_id: number;
  supplier_name: string;
  image_url?: string;
  promo_tag: string;
}

interface EmergingRestaurant {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface ProspectiveRestaurant {
  id: number;
  name: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  potential_needs: string[];
  compatibility_score: number;
}

export interface DriverDeliveryItem {
  id: number;
  order_id: number;
  order_code: string;
  restaurant_name: string;
  delivery_address: string;
  status: string;
  confirmation_code?: string;
  scheduled_time?: string;
}

interface SupplierProductsInfo {
  total_skus: number;
  low_stock_count: number;
  items: {
    id: number;
    name: string;
    unit: string;
    price_per_unit: number;
    stock_available: number;
    sku: string;
    is_active: boolean;
  }[];
}

interface Announcement {
  id: number;
  title: string;
  tag: string;
  tag_color: string;
  date: string;
  summary: string;
  image_url: string;
  action_label: string;
  action_url: string;
}

interface DashboardData {
  orders: { total: number; nuevos: number; activos: number; monto_total: number };
  products: number;
  recent: Order[];
  monthly_history: MonthlyItem[];
  stock_alerts: StockAlert[];
  daily_suggestions: SuggestionItem[];
  daily_discounts: DiscountItem[];
  my_products: SupplierProductsInfo | null;
  emerging_restaurants: EmergingRestaurant[];
  prospective_restaurants?: ProspectiveRestaurant[];
  driver_deliveries?: DriverDeliveryItem[];
  today_deliveries: any[];
  announcements: Announcement[];
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: 'Nueva versión de Xupply con GPS satelital y asignación vehicular',
    tag: 'Novedades de la App',
    tag_color: 'bg-emerald-600',
    date: 'Actualización reciente',
    summary: 'Asignación inmediata de camión o moto a tu equipo de despacho, rutas dinámicas con línea de proximidad estilo DiDi y cálculo de tiempo estimado.',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    action_label: 'Ver Mapa GPS',
    action_url: '/logistica',
  },
  {
    id: 2,
    title: 'Comunidad B2B: Alianza de precios con distribuidores mayoristas',
    tag: 'Comunidad Gastronómica',
    tag_color: 'bg-blue-600',
    date: 'Comunidad',
    summary: 'Más de 40 restaurantes en Bucaramanga y Santander redujeron costos hasta un 18% centralizando compras en Xupply.',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    action_label: 'Explorar Catálogo',
    action_url: '/mercado/catalogo',
  },
  {
    id: 3,
    title: 'Control de inventario automatizado y alertas de stock bajo',
    tag: 'Tips de Gestión',
    tag_color: 'bg-purple-600',
    date: 'Gestión',
    summary: 'Configura stock mínimo en tus insumos prioritarios para recibir alertas tempranas antes de que se agoten en horarios punta.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    action_label: 'Revisar Inventario',
    action_url: '/gestion/inventario',
  },
];

const DEFAULT_DASHBOARD_DATA: DashboardData = {
  orders: { total: 0, nuevos: 0, activos: 0, monto_total: 0 },
  products: 0,
  recent: [],
  monthly_history: [
    { month_key: '2026-04', month_name: 'Abril', orders_count: 14, total_amount: 3200000 },
    { month_key: '2026-05', month_name: 'Mayo', orders_count: 19, total_amount: 4850000 },
    { month_key: '2026-06', month_name: 'Junio', orders_count: 23, total_amount: 6100000 },
    { month_key: '2026-07', month_name: 'Julio', orders_count: 28, total_amount: 7420000 },
    { month_key: '2026-08', month_name: 'Agosto', orders_count: 31, total_amount: 8900000 },
    { month_key: '2026-09', month_name: 'Septiembre', orders_count: 12, total_amount: 3450000 },
  ],
  stock_alerts: [],
  daily_suggestions: [
    {
      id: 101,
      name: 'Aceite Vegetal Palma Real 20L',
      unit: 'bidón',
      price_per_unit: 115000,
      supplier_id: 1,
      supplier_name: 'Distribuidora Santander S.A.S.',
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60',
      reason: 'Precio especial por volumen para restaurantes afiliados',
    },
    {
      id: 102,
      name: 'Pechuga de Pollo Fresca Especial x 1Kg',
      unit: 'kg',
      price_per_unit: 14800,
      supplier_id: 1,
      supplier_name: 'Carnes & Aves del Oriente',
      image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=60',
      reason: 'Insumo de alta rotación con entrega matutina garantizada',
    },
  ],
  daily_discounts: [
    {
      id: 201,
      name: 'Arroz Diana Extra Blanco Bulto 50Kg',
      unit: 'bulto',
      price_per_unit: 195000,
      original_price: 228000,
      discount_pct: 15,
      supplier_id: 1,
      supplier_name: 'Abastos Centrales',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
      promo_tag: '15% OFF HOY',
    },
    {
      id: 202,
      name: 'Queso Mozzarella Bloque 2.5Kg',
      unit: 'bloque',
      price_per_unit: 54000,
      original_price: 64000,
      discount_pct: 16,
      supplier_id: 1,
      supplier_name: 'Lácteos del Valle',
      image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=60',
      promo_tag: 'OFERTA EXPRESS',
    },
  ],
  my_products: null,
  emerging_restaurants: [
    {
      id: 501,
      name: 'Trattoria Bella Napoli',
      city: 'Bucaramanga',
      address: 'Cra 35 #48-22, Cabecera',
      phone: '3187654321',
      email: 'contacto@bellanapoli.com',
      created_at: new Date().toISOString(),
    },
    {
      id: 502,
      name: 'Burgers & Grill Central',
      city: 'Floridablanca',
      address: 'Calle 30 #26-10, Cañaveral',
      phone: '3159876543',
      email: 'compras@burgersgrill.co',
      created_at: new Date().toISOString(),
    },
  ],
  today_deliveries: [],
  announcements: DEFAULT_ANNOUNCEMENTS,
};

/** Solo define el tono de la etiqueta; el texto mostrado sigue viniendo de ORDER_STATUS. */
function statusBadgeClass(status: string): string {
  const value = String(status || '').toLowerCase();
  if (value.includes('deliver') || value.includes('entreg') || value.includes('complet')) return 'x-badge x-badge--success';
  if (value.includes('cancel') || value.includes('reject')) return 'x-badge x-badge--danger';
  if (value.includes('pend') || value.includes('wait')) return 'x-badge x-badge--warn';
  return 'x-badge x-badge--primary';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { add } = useCart();
  const { t, lang } = useLanguage();
  const [data, setData] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA);
  const [fetchNotice, setFetchNotice] = useState(false);

  // Estado del Carrusel de Novedades y Foro
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Menú Desplegable tipo Dashboard interactivo
  const [dashboardMenuExpanded, setDashboardMenuExpanded] = useState(false);

  useEffect(() => {
    api<DashboardData>('/dashboard/summary')
      .then((res) => {
        if (res && typeof res === 'object') {
          setData((prev) => ({
            ...prev,
            ...res,
            orders: { ...prev.orders, ...(res.orders || {}) },
            monthly_history: res.monthly_history && res.monthly_history.length > 0 ? res.monthly_history : prev.monthly_history,
            daily_suggestions: res.daily_suggestions && res.daily_suggestions.length > 0 ? res.daily_suggestions : prev.daily_suggestions,
            daily_discounts: res.daily_discounts && res.daily_discounts.length > 0 ? res.daily_discounts : prev.daily_discounts,
            announcements: res.announcements && res.announcements.length > 0 ? res.announcements : prev.announcements,
            stock_alerts: res.stock_alerts || [],
            emerging_restaurants: res.emerging_restaurants && res.emerging_restaurants.length > 0 ? res.emerging_restaurants : prev.emerging_restaurants,
          }));
          setFetchNotice(false);
        }
      })
      .catch((err) => {
        console.warn('Dashboard fetch notice (using cache):', err);
        setFetchNotice(true);
      });
  }, []);

  useEffect(() => {
    if (user) {
      api('/auth/notify-me').catch(() => undefined);
    }
  }, [user]);

  // Rotación automática del Banner Carrusel
  useEffect(() => {
    if (!data.announcements || data.announcements.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.announcements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [data.announcements, isPaused]);

  const isAdmin = user?.role === 'admin';
  const isSupplier = user?.role === 'proveedor_admin';
  const isRestaurant = !isSupplier && !isAdmin && (!!user?.restaurant_id || user?.role === 'gerente');
  const isDomiciliario = user?.role === 'domiciliario';

  const handleAddSuggestedProduct = (s: SuggestionItem) => {
    const prod: Product = {
      id: s.id,
      name: s.name,
      description: '',
      sku: `SUG-${s.id}`,
      unit: s.unit,
      price_per_unit: s.price_per_unit,
      min_order_qty: 1,
      stock_available: 50,
      image_url: s.image_url || '',
      category: 'Insumos',
      category_id: 1,
      supplier_id: s.supplier_id,
      supplier_name: s.supplier_name,
      is_active: true,
    };
    add(prod, 1);
  };

  const handleAddDiscountedProduct = (d: DiscountItem) => {
    const prod: Product = {
      id: d.id,
      name: d.name,
      description: d.promo_tag,
      sku: `PROMO-${d.id}`,
      unit: d.unit,
      price_per_unit: d.price_per_unit,
      min_order_qty: 1,
      stock_available: 50,
      image_url: d.image_url || '',
      category: 'Ofertas Flash',
      category_id: 1,
      supplier_id: d.supplier_id,
      supplier_name: d.supplier_name,
      is_active: true,
    };
    add(prod, 1);
  };

  const maxMonthAmount = useMemo(() => {
    if (!data.monthly_history || data.monthly_history.length === 0) return 1;
    return Math.max(...data.monthly_history.map((m) => m.total_amount), 1);
  }, [data.monthly_history]);

  const activeAnnouncement = data.announcements && data.announcements[currentSlide];

return (
    <div className="dash x-page">
      <header className="dash__hero">
        <div className="dash__intro">
          <p className="dash__eyebrow">{t('nav.dropdown_dashboard')}</p>
          <h1 className="dash__title">
            {lang === 'es' ? 'Bienvenido' : 'Welcome'}, {user?.name || user?.username || 'Usuario'}
          </h1>
          <p className="dash__subtitle">
            <span>{t('nav.dropdown_dashboard')}</span>
            <span className="dash__subtitle-sep">•</span>
            <span className="dash__role"><span className="dash__role-dot" />{user?.role?.replace('_', ' ')}</span>
          </p>
        </div>

        <div className="dash__actions">
          <Link to="/ajustes" className="x-btn">
            <Menu size={15} />
            {lang === 'es' ? 'Ajustes' : 'Settings'}
          </Link>

          {isAdmin ? (
            <Link to="/admin" className="x-btn x-btn--primary">
              <IconKey className="w-4 h-4" />
              {t('dashboard.admin_panel', lang === 'es' ? 'Panel Maestro Administrador' : 'Master Admin Panel')}
            </Link>
          ) : !isDomiciliario && !isSupplier ? (
            <Link to="/mercado/catalogo" className="x-btn x-btn--primary">
              <IconBox className="w-4 h-4" />
              {t('dashboard.new_b2b_order', lang === 'es' ? 'Nueva Orden B2B' : 'New B2B Order')}
            </Link>
          ) : null}
        </div>
      </header>

      {fetchNotice && (
        <div className="dash__notice" role="status">
          <span className="dash__notice-icon"><Info size={16} /></span>
          <span>{t('dashboard.connection_notice', lang === 'es' ? 'Conexión optimizada en segundo plano. Los datos podrían tardar en actualizarse.' : 'Background connection optimized. Data may take a moment to refresh.')}</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="dash__notice-btn"
          >
            <RefreshCw size={13} />
            {t('dashboard.refresh', lang === 'es' ? 'Actualizar' : 'Refresh')}
          </button>
        </div>
      )}

      <nav className="dash__tabs" aria-label={t('dashboard.operational_summary', lang === 'es' ? 'Resumen operativo' : 'Operational summary')}>
        <span className="dash__tab dash__tab--active" aria-current="page">{t('dashboard.operational_summary', lang === 'es' ? 'Resumen Operativo' : 'Operational Summary')}</span>
        {isRestaurant && (
          <Link to="/gestion/inventario" className="dash__tab">
            {t('dashboard.stock_alerts', lang === 'es' ? 'Alertas de Stock' : 'Stock Alerts')} ({data.stock_alerts.length})
          </Link>
        )}
        {isDomiciliario && (
          <Link to="/logistica" className="dash__tab">{t('dashboard.gps_map', lang === 'es' ? 'Mapa GPS' : 'GPS Map')}</Link>
        )}
      </nav>

        {isDomiciliario ? (
          <div className="dash__kpis dash__kpis--driver">
            <section className="dash__kpi dash__kpi--success">
              <div className="dash__kpi-head">
                <h2 className="dash__kpi-title">{t('dashboard.assigned_deliveries', lang === 'es' ? 'Entregas Asignadas' : 'Assigned Deliveries')}</h2>
                <span className="dash__kpi-icon dash__kpi-icon--success"><IconMotorcycle className="w-5 h-5" /></span>
              </div>
              <strong className="dash__kpi-value">{(data.driver_deliveries || []).length}</strong>
              <div className="dash__kpi-foot">
                <Link to="/mercado/pedidos" className="dash__kpi-link">{t('dashboard.view_delivery_details', lang === 'es' ? 'Ver detalles de entrega →' : 'View delivery details →')}</Link>
              </div>
            </section>

            <section className="dash__kpi">
              <div className="dash__kpi-head">
                <h2 className="dash__kpi-title">{t('dashboard.gps_telemetry', lang === 'es' ? 'Telemetría GPS' : 'GPS Telemetry')}</h2>
                <span className="dash__kpi-icon"><IconGps className="w-5 h-5" /></span>
              </div>
              <div className="dash__kpi-foot">
                <span className="dash__dot" />
                <span className="dash__live">{t('dashboard.gps_live', lang === 'es' ? 'Conectado y Transmitiendo' : 'Connected and Streaming')}</span>
              </div>
              <div className="dash__kpi-foot">
                <Link to="/logistica" className="dash__kpi-link">{t('dashboard.open_satellite_map', lang === 'es' ? 'Abrir Mapa Satelital →' : 'Open Satellite Map →')}</Link>
              </div>
            </section>
          </div>
        ) : (
          <div className="dash__kpis">
            <section className="dash__kpi">
              <div className="dash__kpi-head">
                <h2 className="dash__kpi-title">{isSupplier ? t('dashboard.incoming_orders', lang === 'es' ? 'Pedidos Entrantes' : 'Incoming Orders') : t('dashboard.active_orders', lang === 'es' ? 'Pedidos Activos' : 'Active Orders')}</h2>
                <span className="dash__kpi-icon"><IconOrders className="w-5 h-5" /></span>
              </div>
              <strong className="dash__kpi-value">{data.orders?.activos || 0}</strong>
              <div className="dash__kpi-foot">
                <span className="dash__kpi-positive">{data.orders?.nuevos || 0} {t('dashboard.new', lang === 'es' ? 'Nuevos' : 'New')}</span>
                <span>• {data.orders?.total || 0} {t('dashboard.historical', lang === 'es' ? 'Históricos' : 'Historical')}</span>
              </div>
            </section>

            {isAdmin ? (
              <section className="dash__kpi dash__kpi--violet">
                <div className="dash__kpi-head">
                  <h2 className="dash__kpi-title">{t('dashboard.audit_traceability', lang === 'es' ? 'Auditoría & Trazabilidad' : 'Audit & Traceability')}</h2>
                  <span className="dash__kpi-icon dash__kpi-icon--violet"><IconKey className="w-5 h-5" /></span>
                </div>
                <strong className="dash__kpi-value dash__kpi-value--text">{t('dashboard.live_supervision', lang === 'es' ? 'Supervisión en Vivo' : 'Live Supervision')}</strong>
                <div className="dash__kpi-foot">{t('dashboard.audit_desc', lang === 'es' ? 'Movimientos y auditoría de cada usuario en tiempo real.' : 'Real-time user movements and audit.')}</div>
                <div className="dash__kpi-foot">
                  <Link to="/admin" className="dash__kpi-link">{t('dashboard.view_full_audit', lang === 'es' ? 'Ver auditoría completa →' : 'View full audit →')}</Link>
                </div>
              </section>
            ) : isRestaurant ? (
              <section className="dash__kpi dash__kpi--warn">
                <div className="dash__kpi-head">
                  <h2 className="dash__kpi-title">{t('dashboard.critical_stock', lang === 'es' ? 'Stock Crítico (ROP)' : 'Critical Stock (ROP)')}</h2>
                  <span className="dash__kpi-icon dash__kpi-icon--warn"><IconInventory className="w-5 h-5" /></span>
                </div>
                <strong className="dash__kpi-value">{data.stock_alerts?.length || 0}</strong>
                <div className="dash__kpi-foot">{t('dashboard.supplies', lang === 'es' ? 'insumos' : 'supplies')}</div>
                <div className="dash__kpi-foot">{t('dashboard.reorder_soon', lang === 'es' ? 'Requieren orden de compra pronto.' : 'Require purchase order soon.')}</div>
              </section>
            ) : (
              <section className="dash__kpi">
                <div className="dash__kpi-head">
                  <h2 className="dash__kpi-title">{t('dashboard.my_catalog', lang === 'es' ? 'Mi Catálogo' : 'My Catalog')}</h2>
                  <span className="dash__kpi-icon"><IconBox className="w-5 h-5" /></span>
                </div>
                <strong className="dash__kpi-value">{data.products || 0}</strong>
                <div className="dash__kpi-foot">SKUs</div>
                <div className="dash__kpi-foot">
                  <Link to="/gestion/inventario" className="dash__kpi-link">{t('dashboard.manage_products', lang === 'es' ? 'Gestionar productos →' : 'Manage products →')}</Link>
                </div>
              </section>
            )}

            <section className="dash__kpi">
              <div className="dash__kpi-head">
                <h2 className="dash__kpi-title">{isSupplier ? t('dashboard.month_sales', lang === 'es' ? 'Ventas del Mes' : 'Monthly Sales') : t('dashboard.month_investment', lang === 'es' ? 'Inversión del Mes' : 'Monthly Investment')}</h2>
                <span className="dash__kpi-icon"><IconChart className="w-5 h-5" /></span>
              </div>
              <strong className="dash__kpi-value">{formatMoney(data.orders?.monto_total || 0)}</strong>
              <div className="dash__kpi-foot">
                <span className="dash__kpi-positive">{t('dashboard.in_progress', lang === 'es' ? 'En curso' : 'In progress')}</span>
                <span>• {t('dashboard.data_for', lang === 'es' ? 'Datos de' : 'Data for')} {new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'long' })}</span>
              </div>
            </section>
          </div>
        )}

        <div className="dash__lower">
          <section className="dash__panel">
            <div className="dash__panel-head">
              <h3 className="dash__panel-title">{t('dashboard.quick_access', lang === 'es' ? 'Accesos Rápidos' : 'Quick Access')}</h3>
            </div>
            <div className="dash__panel-body">
              <div className="dash__quick">
                {(isSupplier || isDomiciliario || user?.role === 'admin') && (
                  <Link to="/logistica" className="dash__quick-link">
                    <span className="dash__quick-label"><span className="dash__quick-glyph"><IconGps className="w-5 h-5" /></span>{t('dashboard.live_gps_tracking', lang === 'es' ? 'Rastreo GPS en Vivo' : 'Live GPS Tracking')}</span>
                    <ChevronRight size={15} className="dash__quick-icon" />
                  </Link>
                )}

                {!isDomiciliario && (
                  <Link to={isSupplier ? '/proveedores' : '/mercado/proveedores'} className="dash__quick-link">
                    <span className="dash__quick-label"><span className="dash__quick-glyph"><IconSuppliers className="w-5 h-5" /></span>{isSupplier ? t('dashboard.supplier_directory', lang === 'es' ? 'Directorio de Proveedores' : 'Supplier Directory') : t('nav.suppliers')}</span>
                    <ChevronRight size={15} className="dash__quick-icon" />
                  </Link>
                )}

                {(user?.role === 'gerente' || isSupplier) && (
                  <Link to="/xupply-ia" className="dash__quick-link">
                    <span className="dash__quick-label"><span className="dash__quick-glyph"><IconAi className="w-5 h-5" /></span>{t('dashboard.xupply_ai_assistant', lang === 'es' ? 'Asistente Xupply IA' : 'Xupply AI Assistant')}</span>
                    <ChevronRight size={15} className="dash__quick-icon" />
                  </Link>
                )}
              </div>
            </div>
          </section>

          <section className="dash__panel">
            <div className="dash__panel-head">
              <h3 className="dash__panel-title">{t('dashboard.recent_orders', lang === 'es' ? 'Órdenes Recientes' : 'Recent Orders')}</h3>
              <span className="x-badge x-badge--primary">{data.recent?.length || 0}</span>
            </div>
            <div className="dash__panel-body">
              {data.recent && data.recent.length > 0 ? (
                <div className="dash__feed">
                  {data.recent.slice(0, 4).map(order => (
                    <div key={order.id} className="dash__feed-row">
                      <div className="dash__feed-id">
                        <span className="dash__feed-avatar"><IconOrders className="w-4 h-4" /></span>
                        <div className="dash__feed-copy">
                          <p className="dash__feed-name">{order.restaurant_name || order.supplier_name}</p>
                          <p className="dash__feed-meta">#{order.order_code} • {formatDate(order.created_at)}</p>
                        </div>
                      </div>
                      <div className="dash__feed-end">
                        <span className={statusBadgeClass(order.status)}>
                          {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                        </span>
                        <Link to={`${isSupplier ? '/pedidos' : '/mercado/pedidos'}/${order.id}`} className="dash__feed-link">{t('dashboard.view', lang === 'es' ? 'Ver' : 'View')}</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="x-empty dash__empty">
                  <span className="x-empty__icon"><IconOrders className="w-5 h-5" /></span>
                  <span className="x-empty__title">{t('dashboard.no_recent_activity', lang === 'es' ? 'No hay actividad reciente.' : 'No recent activity.')}</span>
                </div>
              )}
            </div>
          </section>
        </div>
    </div>
  );
}
