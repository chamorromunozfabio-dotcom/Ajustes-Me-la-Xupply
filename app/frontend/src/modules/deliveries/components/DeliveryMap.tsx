import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { divIcon } from 'leaflet';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Crosshair,
  Expand,
  Minimize2,
  Navigation,
  Loader2,
  Phone,
  Package,
  Store,
  User,
  Route as RouteIcon,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { Delivery, DeliveryDetails } from '../../../shared/types';
import { DELIVERY_STATUS } from '../../../shared/utils/constants';
import {
  LatLng,
  coordOf,
  distanceKm,
  fetchRoute,
  formatDistance,
  navigationUrl,
  wazeUrl,
} from '../utils/geo';

type Props = {
  deliveries: Delivery[];
  selected: Delivery | null;
  onSelect: (delivery: Delivery) => void;
  myCoords: LatLng | null;
  heading?: number | null;
  isDriver: boolean;
  liveSpeed: number | null;
  gpsAccuracy: number | null;
  liveEta?: number | null;
  details?: DeliveryDetails | null;
  detailsLoading?: boolean;
  isLoading?: boolean;
  loadError?: string | null;
  /** Arranca el mapa a pantalla completa (modo repartidor). */
  initialFullscreen?: boolean;
  /** Acciones del pedido (cambiar estado, confirmar, asignar...). */
  actions?: ReactNode;
  onOpenOrder?: (delivery: Delivery) => void;
};

const BUCARAMANGA: LatLng = { lat: 7.1193, lng: -73.1227 };

function parseMoney(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `$${n.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

function driverPosition(delivery: Delivery, myCoords: LatLng | null, isMine: boolean): LatLng | null {
  if (isMine && myCoords) return myCoords;
  return coordOf(delivery.vehicle_lat, delivery.vehicle_lng) ?? (isMine ? myCoords : null);
}

function destinationPosition(delivery: Delivery): LatLng | null {
  return coordOf(delivery.dest_lat, delivery.dest_lng);
}

/* ------------------------------------------------------------------ */
/* Efectos del mapa (tamaño, encuadre y seguimiento)                   */
/* ------------------------------------------------------------------ */

function MapSync({
  fullscreen,
  bounds,
  center,
  zoom,
  sheetOpen,
  centerTick,
}: {
  fullscreen: boolean;
  bounds: [[number, number], [number, number]] | null;
  center: LatLng | null;
  zoom?: number;
  sheetOpen: boolean;
  centerTick: number;
}) {
  const map = useMap();
  const lastKey = useRef('');

  // Cualquier cambio de tamaño (fullscreen, rotación, teclado, panel) debe
  // recalcular el tamaño del canvas o Leaflet deja zonas grises.
  useEffect(() => {
    const el = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    observer.observe(el);
    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize({ animate: false }), 180);
    return () => clearTimeout(t);
  }, [fullscreen, sheetOpen, map]);

  useEffect(() => {
    const key = bounds
      ? `b:${bounds.flat().map((n) => n.toFixed(5)).join(',')}:${sheetOpen}:${fullscreen}`
      : center
      ? `c:${center.lat.toFixed(5)},${center.lng.toFixed(5)}:${zoom ?? ''}:${centerTick}`
      : '';
    if (!key || key === lastKey.current) return;
    lastKey.current = key;

    if (bounds) {
      // Deja aire arriba (tarjetas) y abajo (hoja de resumen) para que el
      // recorrido no quede escondido detrás del HUD.
      map.fitBounds(bounds, {
        paddingTopLeft: [24, fullscreen ? 210 : 170],
        paddingBottomRight: [24, sheetOpen ? 300 : 190],
        maxZoom: 16,
        animate: true,
        duration: 0.6,
      });
    } else if (center) {
      map.setView([center.lat, center.lng], zoom ?? map.getZoom(), { animate: true });
    }
  }, [bounds, center, zoom, sheetOpen, fullscreen, centerTick, map]);

  return null;
}

/* ------------------------------------------------------------------ */
/* Marcadores                                                          */
/* ------------------------------------------------------------------ */

function vehicleIcon(heading: number | null, active: boolean) {
  const rotation = Number.isFinite(heading as number) ? Number(heading) : 0;
  return divIcon({
    className: 'xupply-map-icon',
    html: `
      <div class="xupply-vehicle ${active ? 'is-active' : ''}">
        <span class="xupply-vehicle__pulse"></span>
        <span class="xupply-vehicle__dot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
               stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${rotation}deg)">
            <path d="M12 3l7 18-7-4-7 4 7-18z" fill="currentColor" stroke="none"></path>
          </svg>
        </span>
      </div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}

function destinationIcon() {
  return divIcon({
    className: 'xupply-map-icon',
    html: `
      <div class="xupply-destination">
        <span class="xupply-destination__ring"></span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 42],
  });
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

export default function DeliveryMap({
  deliveries,
  selected,
  onSelect,
  myCoords,
  heading,
  isDriver,
  liveSpeed,
  gpsAccuracy,
  liveEta,
  details,
  detailsLoading,
  isLoading = false,
  loadError = null,
  initialFullscreen = false,
  actions,
  onOpenOrder,
}: Props) {
  const [fullscreen, setFullscreen] = useState(initialFullscreen);
  const [sheetOpen, setSheetOpen] = useState(initialFullscreen);
  const [route, setRoute] = useState<{ points: [number, number][]; distanceKm: number; durationMin: number } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [centerTick, setCenterTick] = useState(0);

  const active = useMemo(
    () => deliveries.filter((d) => d.status !== 'entregado' && d.status !== 'fallido'),
    [deliveries]
  );

  const target = selected ?? (isDriver ? active[0] ?? null : null);

  const origin = target ? driverPosition(target, myCoords, isDriver) : myCoords;
  const destination = target ? destinationPosition(target) : null;

  const straightDistance = origin && destination ? distanceKm(origin, destination) : null;

  // Ruta real (OSRM) con cancelación para no dejar peticiones colgadas.
  useEffect(() => {
    if (!origin || !destination) {
      setRoute(null);
      return;
    }
    let cancelled = false;
    setRouteLoading(true);
    fetchRoute(origin, destination)
      .then((result) => {
        if (!cancelled) setRoute(result);
      })
      .finally(() => {
        if (!cancelled) setRouteLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  // Bloqueo de scroll + Escape para salir de pantalla completa.
  useEffect(() => {
    if (!fullscreen) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [fullscreen]);

  // Mantiene el sheet abierto al pasar a pantalla completa.
  useEffect(() => {
    if (initialFullscreen) return;
    setSheetOpen(fullscreen);
  }, [fullscreen, initialFullscreen]);

  const bounds = useMemo<[[number, number], [number, number]] | null>(() => {
    if (route?.points.length) {
      const lats = route.points.map((p) => p[0]);
      const lngs = route.points.map((p) => p[1]);
      return [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];
    }
    if (origin && destination) {
      return [
        [Math.min(origin.lat, destination.lat), Math.min(origin.lng, destination.lng)],
        [Math.max(origin.lat, destination.lat), Math.max(origin.lng, destination.lng)],
      ];
    }
    return null;
  }, [route, origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  const mapCenter = origin ?? destination ?? myCoords ?? BUCARAMANGA;

  const distance = route?.distanceKm ?? straightDistance;
  const approxMinutes =
    distance != null
      ? Math.max(1, Math.round((distance / (liveSpeed && liveSpeed > 5 ? liveSpeed : 25)) * 60))
      : null;
  const eta = liveEta ?? route?.durationMin ?? approxMinutes;

  const status = target ? DELIVERY_STATUS[target.status] ?? DELIVERY_STATUS.asignado : null;
  const items = details?.order_items ?? [];
  const total = details?.order_total ?? target?.order_total;
  const ownerName = details?.restaurant_name ?? target?.restaurant_name ?? '—';
  const ownerPhone = details?.restaurant_phone ?? target?.restaurant_phone ?? null;
  const requester = details?.created_by_name ?? target?.created_by_name ?? null;
  const supplier = details?.supplier_name ?? target?.supplier_name ?? null;
  const notes = details?.notes ?? target?.order_notes ?? target?.notes ?? null;
  const unitCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const copyAddress = useCallback(async () => {
    const address = target?.delivery_address;
    if (!address || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* sin permiso de portapapeles */
    }
  }, [target?.delivery_address]);

  return (
    <section
      aria-label="Mapa de seguimiento de la entrega"
      className={`dlv-map ${fullscreen ? 'dlv-map--full' : ''}`}
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={target?.status === 'en_camino' ? 16 : 13}
        zoomControl={false}
        className="dlv-map__canvas"
      >
        <TileLayer
          className="xupply-tiles"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapSync
          fullscreen={fullscreen}
          bounds={bounds}
          center={bounds ? null : mapCenter}
          zoom={bounds ? undefined : 16}
          sheetOpen={sheetOpen}
          centerTick={centerTick}
        />

        {/* Ruta real o línea aproximada */}
        {route ? (
          <>
            <Polyline positions={route.points} pathOptions={{ color: '#0f172a', weight: 9, opacity: 0.18 }} />
            <Polyline
              positions={route.points}
              pathOptions={{ color: '#0284c7', weight: 5, opacity: 0.95, className: 'dlv-route' }}
            />
          </>
        ) : (
          origin &&
          destination && (
            <Polyline
              positions={[
                [origin.lat, origin.lng],
                [destination.lat, destination.lng],
              ]}
              pathOptions={{
                color: '#0284c7',
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 8',
                className: 'dlv-route',
              }}
            />
          )
        )}

        {/* Mi posición con halo de precisión */}
        {myCoords && (
          <>
            <CircleMarker
              center={[myCoords.lat, myCoords.lng]}
              radius={Math.min(Math.max((gpsAccuracy || 20) / 2, 12), 50)}
              pathOptions={{
                color: '#0284c7',
                weight: 1.5,
                fillColor: '#38bdf8',
                fillOpacity: 0.16,
                dashArray: '3, 3',
                className: 'dlv-radius',
              }}
            />
            <CircleMarker
              center={[myCoords.lat, myCoords.lng]}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                weight: 2.5,
                fillColor: '#0284c7',
                fillOpacity: 1,
                className: 'dlv-driver',
              }}
            />
          </>
        )}

        {/* Vehículos de las entregas activas */}
        {active.map((delivery) => {
          const pos = driverPosition(delivery, myCoords, isDriver);
          if (!pos) return null;
          const isSelected = target?.id === delivery.id;
          return (
            <Marker
              key={`veh-${delivery.id}`}
              position={[pos.lat, pos.lng]}
              icon={vehicleIcon(isSelected ? heading ?? null : null, isSelected)}
              eventHandlers={{ click: () => onSelect(delivery) }}
              zIndexOffset={isSelected ? 800 : 0}
            >
              <Popup>
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-sky-700">{delivery.driver_name || 'Sin domiciliario'}</p>
                  <p className="text-slate-600">
                    {delivery.vehicle_name || 'Vehículo'} {delivery.plate ? `· ${delivery.plate}` : ''}
                  </p>
                  <p className="font-mono text-[11px] text-slate-500">{delivery.order_code}</p>
                  <p className="font-semibold text-emerald-700">{DELIVERY_STATUS[delivery.status]?.label}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Destino del pedido seleccionado */}
        {destination && target && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon()} zIndexOffset={900}>
            <Popup>
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-emerald-700">Punto de entrega</p>
                <p className="font-semibold text-slate-800">{target.delivery_address}</p>
                <p className="text-slate-600">{ownerName}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ----------------------------- HUD superior ----------------------------- */}
      <div className="dlv-map__hud">
        {/* Barra de estado */}
        <div className="dlv-map__status-row">
          <div className="dlv-map__status">
            <span className={`dlv-map__status-dot ${isDriver ? 'dlv-map__status-dot--live' : ''}`} aria-hidden="true" />
            <span className="dlv-map__code">{target?.order_code ?? 'Sin entrega seleccionada'}</span>
            {status && <span className="dlv-map__status-badge">{status.label}</span>}
            {gpsAccuracy != null && <span className="dlv-map__accuracy">GPS ±{gpsAccuracy} m</span>}
          </div>

          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            aria-label={fullscreen ? 'Salir de pantalla completa' : 'Ver mapa en pantalla completa'}
            title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="dlv-map__icon-btn"
          >
            {fullscreen ? <Minimize2 aria-hidden="true" /> : <Expand aria-hidden="true" />}
          </button>
        </div>

        {/* Destino: "para dónde es" */}
        {target && (
          <div className="dlv-map__target">
            <div className="dlv-map__target-head">
              <div className="dlv-map__target-icon">
                <Navigation aria-hidden="true" />
              </div>
              <div className="dlv-map__target-copy">
                <p className="dlv-map__label">Para dónde es</p>
                <p className="dlv-map__address">{target.delivery_address || 'Dirección sin registrar'}</p>
                <div className="dlv-map__meta">
                  <span className="inline-flex items-center gap-1">
                    <RouteIcon aria-hidden="true" className="w-3 h-3" />
                    {distance != null ? formatDistance(distance) : 'Sin ruta'}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="dlv-map__eta">
                    {eta != null ? `~${eta} min` : routeLoading ? 'Calculando…' : '—'}
                  </span>
                  {!destination && (
                    <span className="dlv-map__warning">
                      <AlertTriangle aria-hidden="true" className="w-3 h-3" /> Sin coordenadas
                    </span>
                  )}
                </div>

                {/* Propietario y valor del pedido, visibles sin abrir la hoja */}
                <div className="dlv-map__owner">
                  <span className="dlv-map__owner-name">
                    <Store aria-hidden="true" />
                    <span className="truncate">{ownerName}</span>
                  </span>
                  {total != null && total !== '' && <span className="dlv-map__price">{parseMoney(total)}</span>}
                  {items.length > 0 && <span>· {items.length} producto(s)</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={copyAddress}
                aria-label="Copiar dirección"
                className="dlv-map__copy"
              >
                {copied ? <Check aria-hidden="true" className="text-emerald-600" /> : <Copy aria-hidden="true" />}
              </button>
            </div>

            <div className="dlv-map__nav">
              {destination ? (
                <a
                  href={navigationUrl(destination)}
                  target="_blank"
                  rel="noreferrer"
                  className="dlv-map__nav-link"
                >
                  <Navigation aria-hidden="true" />
                  Ir ahora
                </a>
              ) : (
                <span className="dlv-map__nav-disabled" aria-disabled="true">Sin ruta</span>
              )}
              {destination ? (
                <a
                  href={wazeUrl(destination)}
                  target="_blank"
                  rel="noreferrer"
                  className="dlv-map__nav-alt"
                >
                  <RouteIcon aria-hidden="true" />
                  Waze
                </a>
              ) : (
                <span className="dlv-map__nav-disabled">Falta geolocalizar</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --------------------------- Controles laterales --------------------------- */}
      <div className="dlv-map__controls">
        <button
          type="button"
          onClick={() => {
            if (myCoords) setCenterTick((t) => t + 1);
          }}
          aria-label="Centrar en mi ubicación"
          title="Mi ubicación"
          className={`dlv-map__ctrl ${myCoords ? '' : 'dlv-map__ctrl--muted'}`}
        >
          <Crosshair aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setSheetOpen((v) => !v)}
          aria-label={sheetOpen ? 'Ocultar resumen del pedido' : 'Ver resumen del pedido'}
          title="Resumen del pedido"
          className="dlv-map__ctrl"
        >
          <Package aria-hidden="true" />
        </button>
      </div>

      {/* --------------------- Estado vacío / de carga --------------------- */}
      {!target && (
        <div className="dlv-map__empty">
          <div className="dlv-map__empty-card">
            {loadError ? (
              <>
                <AlertTriangle aria-hidden="true" />
                <p className="dlv-map__empty-title">No se pudieron cargar las entregas</p>
                <p className="dlv-map__empty-text">{loadError}</p>
              </>
            ) : isLoading ? (
              <>
                <Loader2 aria-hidden="true" className="dlv-map__spinner" />
                <p className="dlv-map__empty-title">Cargando entregas…</p>
                <p className="dlv-map__empty-text">Sincronizando con el servidor.</p>
              </>
            ) : (
              <>
                <Package aria-hidden="true" />
                <p className="dlv-map__empty-title">Sin entregas activas</p>
                <p className="dlv-map__empty-text">
                  {isDriver
                    ? 'Cuando te asignen un pedido aparecerá aquí automáticamente.'
                    : 'Selecciona una entrega de la lista para ver su recorrido.'}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------ Hoja inferior ------------------------------ */}
      {target && (
        <div className="dlv-sheet">
          <span className="dlv-sheet__grip" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setSheetOpen((v) => !v)}
            aria-expanded={sheetOpen}
            className="dlv-sheet__head"
          >
            <span className="dlv-sheet__icon">
              <Package aria-hidden="true" />
            </span>
            <span className="dlv-sheet__copy">
              <span className="dlv-sheet__title">
                {items.length ? `${items.length} producto(s) · ${unitCount} unidad(es)` : 'Resumen del pedido'}
              </span>
              <span className="dlv-sheet__meta">
                {ownerName}
                {total != null && total !== '' ? ` · ${parseMoney(total)}` : ''}
              </span>
            </span>
            <span className="dlv-sheet__chevron">
              {sheetOpen ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
            </span>
          </button>

          {sheetOpen && (
            <div className="dlv-sheet__body">
              {/* Propietario */}
              <div className="dlv-info-grid">
                <div className="dlv-info">
                  <p className="dlv-info__label">
                    <Store aria-hidden="true" /> Propietario del pedido
                  </p>
                  <p className="dlv-info__value">{ownerName}</p>
                  {supplier && <p className="dlv-info__sub">Proveedor: {supplier}</p>}
                  {ownerPhone && (
                    <a href={`tel:${ownerPhone}`} className="dlv-info__phone">
                      <Phone aria-hidden="true" /> {ownerPhone}
                    </a>
                  )}
                </div>

                <div className="dlv-info">
                  <p className="dlv-info__label">
                    <User aria-hidden="true" /> Quién recibe
                  </p>
                  <p className="dlv-info__value">{requester || ownerName}</p>
                  <p className="dlv-info__sub">
                    {target.driver_name ? `Domiciliario: ${target.driver_name}` : 'Sin domiciliario asignado'}
                    {target.plate ? ` · ${target.plate}` : ''}
                  </p>
                </div>
              </div>

              {/* Resumen del pedido */}
              <div className="dlv-order">
                <div className="dlv-order__head">
                  <p className="dlv-order__label">Resumen del pedido</p>
                  <span className="dlv-order__total">{parseMoney(total)}</span>
                </div>

                {detailsLoading ? (
                  <div className="dlv-sheet__skeleton" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>
                ) : items.length ? (
                  <ul className="dlv-order__list">
                    {items.slice(0, 6).map((item) => (
                      <li key={item.id} className="dlv-order__item">
                        <span className="dlv-order__qty">{item.quantity}</span>
                        <span className="dlv-order__name">
                          {item.name}
                          {item.unit ? <span className="dlv-order__unit"> · {item.unit}</span> : null}
                        </span>
                        <span className="dlv-order__subtotal">{parseMoney(item.subtotal)}</span>
                      </li>
                    ))}
                    {items.length > 6 && (
                      <li className="dlv-order__item dlv-order__unit">
                        +{items.length - 6} producto(s) más en el pedido
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="dlv-order__empty">Este pedido no tiene detalle de productos registrado.</p>
                )}

                {notes && (
                  <p className="dlv-order__notes">
                    <b>Notas: </b>
                    {notes}
                  </p>
                )}
              </div>

              {/* Acciones del pedido */}
              {actions ? (
                <div className="dlv-sheet__actions">{actions}</div>
              ) : onOpenOrder ? (
                <button
                  type="button"
                  onClick={() => onOpenOrder(target)}
                  className="dlv-sheet__link"
                >
                  Ver pedido completo
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
