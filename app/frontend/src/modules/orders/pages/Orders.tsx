import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownWideNarrow, Compass, Filter, Package, RefreshCw } from 'lucide-react';
import { api } from '../../../shared/api/client';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSocketSubscription } from '../../../shared/hooks/useSocketSubscription';
import { Order } from '../../../shared/types';
import { ORDER_STATUS } from '../../../shared/utils/constants';
import OrderCard from '../components/OrderCard';
import '../Orders.css';

export default function Orders() {
  const { user } = useAuth();
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
        setError((err as Error).message || 'No se pudieron cargar los pedidos.');
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
          <p className="ord__eyebrow">Operaciones · Pedidos</p>
          <h1 className="ord__title">Pedidos</h1>
          <p className="ord__subtitle">
            {isSupplier
              ? 'Pedidos que tus clientes te enviaron, en orden de llegada.'
              : isDriver
              ? 'Entregas asignadas a ti.'
              : 'Historial y estado de tus compras mayoristas.'}
          </p>
        </div>

        <div className="ord__filters">
          <div className="ord__filter">
            <Filter aria-hidden="true" />
            <label className="sr-only" htmlFor="orders-status">
              Filtrar por estado
            </label>
            <select
              id="orders-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="x-select"
            >
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {value === '' ? 'Todos los estados' : ORDER_STATUS[value]?.label ?? value}
                </option>
              ))}
            </select>
          </div>
          <div className="ord__filter">
            <ArrowDownWideNarrow aria-hidden="true" />
            <label className="sr-only" htmlFor="orders-sort">
              Ordenar por precio
            </label>
            <select
              id="orders-sort"
              value={priceSort}
              onChange={(event) => setPriceSort(event.target.value as 'asc' | 'desc' | '')}
              className="x-select"
            >
              <option value="">Ordenar por precio</option>
              <option value="desc">Mayor a menor</option>
              <option value="asc">Menor a mayor</option>
            </select>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="x-btn ord__refresh"
            title="Actualizar pedidos"
          >
            <RefreshCw aria-hidden="true" className="w-3.5 h-3.5" />
            Actualizar
          </button>
        </div>
      </header>

      {!loading && visibleOrders.length > 0 && (
        <div className="ord__toolbar">
          <span className="ord__count">
            {visibleOrders.length} pedido(s) {status ? 'con el filtro activo' : 'en total'}
          </span>
          <span className="ord__live">
            <span className="ord__live-dot" aria-hidden="true" />
            Sincronización automática · 30 s
          </span>
        </div>
      )}

      {error && (
        <div className="ord__error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={load} className="x-btn x-btn--sm">
            <RefreshCw aria-hidden="true" className="w-3 h-3" />
            Reintentar
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
            {status ? 'No hay pedidos con ese estado' : 'Todavía no hay pedidos'}
          </h2>
          <p className="x-empty__text">
            {status
              ? 'Prueba con otro estado o limpia el filtro.'
              : isSupplier
              ? 'Cuando un restaurante te compre, el pedido aparecerá aquí automáticamente.'
              : isDriver
              ? 'Cuando te asignen una entrega, la verás en tu ruta.'
              : 'Explora el catálogo mayorista y crea tu primer pedido.'}
          </p>
          <div className="x-cluster" style={{ marginTop: 10 }}>
            {status ? (
              <button type="button" onClick={() => setStatus('')} className="x-btn x-btn--primary">
                Ver todos
              </button>
            ) : isDriver ? (
              <Link to="/repartidor" className="x-btn x-btn--primary">
                <Compass aria-hidden="true" className="w-3.5 h-3.5" />
                Ir a mi ruta
              </Link>
            ) : isSupplier ? (
              <Link to="/" className="x-btn x-btn--primary">
                Volver al panel
              </Link>
            ) : (
              <Link to="/catalogo" className="x-btn x-btn--primary">
                Explorar catálogo
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
        <p className="ord__hint">Los estados se actualizan solos mientras la pestaña esté abierta.</p>
      )}
    </div>
  );
}
