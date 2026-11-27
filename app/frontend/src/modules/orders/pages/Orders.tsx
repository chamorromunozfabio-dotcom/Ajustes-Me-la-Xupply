import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDownWideNarrow, Compass, Filter, Package, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../shared/api/client';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSocketSubscription } from '../../../shared/hooks/useSocketSubscription';
import { Order } from '../../../shared/types';
import { ORDER_STATUS } from '../../../shared/utils/constants';
import OrderCard from '../components/OrderCard';
import '../Orders.css';

export default function Orders() {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSupplier = user?.role === 'proveedor_admin';
  const isDriver = user?.role === 'domiciliario';

  const load = useCallback(() => {
    setError('');
    const qs = status ? `?status=${status}` : '';
    api<Order[]>(`/orders${qs}`)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError((err as Error).message || t('load_error'));
      })
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = () => load();
  useSocketSubscription({ 'order:created': refresh, 'order:updated': refresh }, [load]);

  // En Vercel no hay Socket.IO persistente: se refresca por polling cuando la
  // pestaña está visible para no mostrar estados desactualizados.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const visibleOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      if (priceSort === 'asc') return Number(a.total) - Number(b.total);
      if (priceSort === 'desc') return Number(b.total) - Number(a.total);
      return 0;
    });
  }, [orders, priceSort]);

  const statuses = ['', 'nuevo', 'confirmado', 'preparando', 'despachado', 'en_camino', 'entregado', 'cancelado'];

  return (
    <div className="ord x-page">
      <header className="ord__hero">
        <div>
          <p className="ord__eyebrow">{t('eyebrow')}</p>
          <h1 className="ord__title">{t('title')}</h1>
          <p className="ord__subtitle">
            {isSupplier
              ? t('subtitle_supplier')
              : isDriver
              ? t('subtitle_driver')
              : t('subtitle_restaurant')}
          </p>
        </div>

        <div className="ord__filters">
          <div className="ord__filter">
            <Filter aria-hidden="true" />
            <label className="sr-only" htmlFor="orders-status">
              {t('filter_status')}
            </label>
            <select
              id="orders-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="x-select"
            >
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {value === '' ? t('all_statuses') : t(`status.${value}`, { defaultValue: ORDER_STATUS[value]?.label ?? value })}
                </option>
              ))}
            </select>
          </div>
          <div className="ord__filter">
            <ArrowDownWideNarrow aria-hidden="true" />
            <label className="sr-only" htmlFor="orders-sort">
              {t('sort_price')}
            </label>
            <select
              id="orders-sort"
              value={priceSort}
              onChange={(event) => setPriceSort(event.target.value as 'asc' | 'desc' | '')}
              className="x-select"
            >
              <option value="">{t('sort_price')}</option>
              <option value="desc">{t('sort_desc')}</option>
              <option value="asc">{t('sort_asc')}</option>
            </select>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="x-btn ord__refresh"
            title={t('refresh')}
          >
            <RefreshCw aria-hidden="true" className="w-3.5 h-3.5" />
            {t('refresh')}
          </button>
        </div>
      </header>

      {!loading && visibleOrders.length > 0 && (
        <div className="ord__toolbar">
          <span className="ord__count">
            {t('count', { count: visibleOrders.length, suffix: status ? t('count_filtered') : t('count_total') })}
          </span>
          <span className="ord__live">
            <span className="ord__live-dot" aria-hidden="true" />
            {t('auto_sync')}
          </span>
        </div>
      )}

      {error && (
        <div className="ord__error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={load} className="x-btn x-btn--sm">
            <RefreshCw aria-hidden="true" className="w-3 h-3" />
            {t('retry')}
          </button>
        </div>
      )}

      {loading ? (
        <div className="ord__skeletons" aria-hidden>
          {[0, 1, 2].map((index) => (
            <div key={index} className="x-skeleton ord__skeleton" />
          ))}
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="x-empty">
          <div className="x-empty__icon">
            <Package className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="x-empty__title">
            {status ? t('empty_filtered_title') : t('empty_title')}
          </h2>
          <p className="x-empty__text">
            {status
              ? t('empty_filtered_text')
              : isSupplier
              ? t('empty_supplier')
              : isDriver
              ? t('empty_driver')
              : t('empty_restaurant')}
          </p>
          <div className="x-cluster" style={{ marginTop: 10 }}>
            {status ? (
              <button type="button" onClick={() => setStatus('')} className="x-btn x-btn--primary">
                {t('view_all')}
              </button>
            ) : isDriver ? (
              <Link to="/repartidor" className="x-btn x-btn--primary">
                <Compass aria-hidden="true" className="w-3.5 h-3.5" />
                {t('go_route')}
              </Link>
            ) : isSupplier ? (
              <Link to="/" className="x-btn x-btn--primary">
                {t('back_panel')}
              </Link>
            ) : (
              <Link to={location.pathname.startsWith('/mercado') ? '/mercado/catalogo' : '/catalogo'} className="x-btn x-btn--primary">
                {t('explore_catalog')}
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="ord__list">
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} isSupplier={isSupplier} />
          ))}
        </div>
      )}

      {!loading && visibleOrders.length > 0 && (
        <p className="ord__hint">{t('hint')}</p>
      )}
    </div>
  );
}
