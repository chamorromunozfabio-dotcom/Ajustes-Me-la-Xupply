import { Link } from 'react-router-dom';
import { ArrowUpDown, ClipboardList, RefreshCw, Search, X } from 'lucide-react';
import { Delivery } from '../../../shared/types';
import { DELIVERY_STATUS } from '../../../shared/utils/constants';
import { formatDistance } from '../utils/geo';
import {
  calculateDistanceKm,
  destinationPositionFor,
  driverPositionFor,
} from '../utils/positions';

export default function DeliverySidePanel({
  activeCount,
  query,
  onQueryChange,
  sortBy,
  onSortToggle,
  onlyActive,
  onOnlyActiveChange,
  onRefresh,
  loadError,
  loading,
  deliveriesCount,
  visibleDeliveries,
  selectedId,
  isDriver,
  myCoords,
  canManage,
  pendingOrders,
  onSelect,
}: {
  activeCount: number;
  query: string;
  onQueryChange: (value: string) => void;
  sortBy: 'cercanas' | 'recientes';
  onSortToggle: () => void;
  onlyActive: boolean;
  onOnlyActiveChange: (value: boolean) => void;
  onRefresh: () => void;
  loadError: string;
  loading: boolean;
  deliveriesCount: number;
  visibleDeliveries: Delivery[];
  selectedId?: number;
  isDriver: boolean;
  myCoords: { lat: number; lng: number } | null;
  canManage: boolean;
  pendingOrders: any[];
  onSelect: (delivery: Delivery) => void;
}) {
  return (
    <div className="dlv-panel">
      <div className="dlv-panel__head">
        <h3 className="dlv-panel__title">
          <ClipboardList aria-hidden="true" />
          Entregas
        </h3>
        <span className="dlv-panel__count">{activeCount} activa(s)</span>
      </div>

      <div className="dlv-panel__search">
        <Search aria-hidden="true" />
        <label className="sr-only" htmlFor="delivery-search">Buscar entregas</label>
        <input
          id="delivery-search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar pedido, dirección..."
          className="x-input"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Limpiar búsqueda"
            className="dlv-panel__clear"
          >
            <X aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="dlv-panel__tabs">
        <button
          type="button"
          onClick={onSortToggle}
          className="dlv-panel__sort"
          title="Cambiar el orden de la lista"
        >
          <ArrowUpDown aria-hidden="true" />
          {sortBy === 'cercanas' ? 'Cercanas' : 'Recientes'}
        </button>
        <button
          type="button"
          onClick={() => onOnlyActiveChange(true)}
          className={`dlv-panel__tab ${onlyActive ? 'dlv-panel__tab--active' : ''}`}
        >
          Activas
        </button>
        <button
          type="button"
          onClick={() => onOnlyActiveChange(false)}
          className={`dlv-panel__tab ${!onlyActive ? 'dlv-panel__tab--active' : ''}`}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="dlv-panel__refresh"
          title="Actualizar"
        >
          <RefreshCw aria-hidden="true" /> Actualizar
        </button>
      </div>

      {loadError && <div className="dlv-panel__error">{loadError}</div>}

      <div className="dlv-panel__list">
        {loading && deliveriesCount === 0 && (
          <div aria-hidden>
            {[0, 1, 2].map((i) => <div key={i} className="dlv-panel__skeleton" />)}
          </div>
        )}

        {!loading && visibleDeliveries.length === 0 && (
          <div className="dlv-panel__empty">
            <p className="dlv-panel__empty-title">
              {query ? 'Sin resultados para tu búsqueda.' : 'No hay entregas para mostrar.'}
            </p>
            <p className="dlv-panel__empty-text">
              {canManage
                ? 'Asigna un pedido para comenzar el seguimiento.'
                : 'Espera a que te asignen una entrega.'}
            </p>
          </div>
        )}

        {visibleDeliveries.map((delivery, index) => {
          const isCurrent = selectedId === delivery.id;
          const st = DELIVERY_STATUS[delivery.status] ?? DELIVERY_STATUS.asignado;
          const from = driverPositionFor(delivery, isDriver ? myCoords : null);
          const to = destinationPositionFor(delivery);
          const legDistance = from && to ? calculateDistanceKm(from, to) : null;

          return (
            <button
              key={delivery.id}
              type="button"
              onClick={() => onSelect(delivery)}
              className={`dlv-delivery ${isCurrent ? 'dlv-delivery--active' : ''}`}
            >
              <span className="dlv-delivery__top">
                <span className="dlv-delivery__code">
                  {index === 0 && sortBy === 'cercanas' && !query && (
                    <span className="dlv-delivery__next">Siguiente</span>
                  )}
                  <span className="truncate">{delivery.order_code}</span>
                </span>
                <span className={`dlv-delivery__status ${st.color}`}>{st.label}</span>
              </span>
              <span className="dlv-delivery__name">{delivery.restaurant_name}</span>
              <span className="dlv-delivery__address">{delivery.delivery_address || 'Sin dirección'}</span>
              <span className="dlv-delivery__foot">
                <span>{delivery.driver_name || 'Sin domiciliario'}</span>
                <span className="dlv-delivery__distance">
                  {legDistance != null ? formatDistance(legDistance) : 'sin GPS'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {pendingOrders.length > 0 && canManage && (
        <div className="dlv-panel__pending">
          <p className="dlv-panel__pending-title">Pedidos por asignar ({pendingOrders.length})</p>
          <div className="dlv-panel__pending-list">
            {pendingOrders.map((po) => (
              <div key={po.id} className="dlv-panel__pending-row">
                <div className="dlv-panel__pending-copy">
                  <span className="dlv-panel__pending-code">{po.order_code}</span>
                  <p className="dlv-panel__pending-name">{po.restaurant_name}</p>
                </div>
                <Link to={`/pedidos/${po.id}`} className="dlv-panel__pending-link">
                  Asignar
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
