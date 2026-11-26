import { errorMessage, toast } from '../../../shared/utils/feedback';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  KeyRound,
  MapPin,
  MapPinned,
  Package,
  Pencil,
  ShieldCheck,
  StickyNote,
  Truck,
  UserPlus,
} from 'lucide-react';
import { api } from '../../../shared/api/client';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSocketSubscription } from '../../../shared/hooks/useSocketSubscription';
import { useNotifications } from '../../../shared/context/NotificationContext';
import { Order } from '../../../shared/types';
import { SUPPLIER_FLOW, formatMoney, formatDate } from '../../../shared/utils/constants';
import Modal from '../../../shared/ui/Modal';
import { orderStatusBadgeClass, orderStatusLabel } from '../presentation';
import '../Orders.css';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { push } = useNotifications();
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<{ action: string; new_values: string; created_at: string }[]>([]);
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [drivers, setDrivers] = useState<{ id: number; name: string; username: string; phone?: string; role_label?: string; role_name?: string }[]>([]);
  const [vehicles, setVehicles] = useState<{ id: number; name: string; plate: string; type: string }[]>([]);
  const [securityKeyInput, setSecurityKeyInput] = useState('');
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [paying, setPaying] = useState(false);

  const payOrder = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const res = await api<{ checkout_url: string }>(`/payments/checkout/order/${order.id}`, {
        method: 'POST',
      });
      window.location.href = res.checkout_url;
    } catch (err) {
      toast(errorMessage(err), 'error');
      setPaying(false);
    }
  };

  const completeWithKey = async (deliveryId: number) => {
    if (!securityKeyInput.trim()) {
      setKeyError('Por favor digita la llave de 4 dígitos proporcionada por el domiciliario');
      return;
    }
    setVerifyingKey(true);
    setKeyError('');
    try {
      await api(`/deliveries/${deliveryId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ confirmation_code: securityKeyInput.trim() }),
      });
      push({ message: '¡Envío completado exitosamente con la llave de entrega!', at: new Date().toISOString() });
      setSecurityKeyInput('');
      load();
    } catch (err) {
      setKeyError((err as Error).message);
    } finally {
      setVerifyingKey(false);
    }
  };

  const isGerente = user?.role === 'gerente';
  const isDriver = user?.role === 'domiciliario';
  const isSupplier = user?.role === 'proveedor_admin';
  const canManageDelivery = isSupplier || user?.role === 'admin';
  const [deliveryForm, setDeliveryForm] = useState({ vehicle_id: '', driver_id: '', scheduled_time: '' });

  const load = () => {
    api<Order>(`/orders/${id}`).then(setOrder).catch(console.error);
    api<{ action: string; new_values: string; created_at: string }[]>(`/orders/${id}/history`).then(setHistory).catch(() => undefined);
  };

  useEffect(() => {
    load();
    if (canManageDelivery) {
      api<{ id: number; name: string; username: string; phone?: string; role_label?: string; role_name?: string }[]>('/deliveries/drivers').then(setDrivers).catch(() => undefined);
      api<{ id: number; name: string; plate: string; type: string }[]>('/deliveries/vehicles').then(setVehicles).catch(() => undefined);
    }
  }, [id, canManageDelivery]);

  const onOrderUpdate = (o: Order) => {
    if (String(o.id) === String(id)) load();
  };
  useSocketSubscription({ 'order:updated': onOrderUpdate }, [id, canManageDelivery]);

  const changeStatus = async (status: string) => {
    try {
      await api<Order>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      push({ message: `Pedido actualizado → ${status}`, at: new Date().toISOString() });
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const createDelivery = async () => {
    try {
      await api('/deliveries', {
        method: 'POST',
        body: JSON.stringify({
          order_id: order!.id,
          vehicle_id: deliveryForm.vehicle_id ? Number(deliveryForm.vehicle_id) : null,
          driver_id: deliveryForm.driver_id ? Number(deliveryForm.driver_id) : null,
          scheduled_time: deliveryForm.scheduled_time || null,
          items: order!.items.map((i) => ({ product_name: i.name, quantity: i.quantity, unit: i.unit })),
        }),
      });
      push({ message: 'Entrega creada y asignada al domiciliario exitosamente', at: new Date().toISOString() });
      setDeliveryModal(false);
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (!order) return <div className="x-empty">Cargando pedido...</div>;

  const done = ['entregado', 'cancelado'].includes(order.status);
  const latestDelivery = order.deliveries && order.deliveries.length > 0 ? order.deliveries[0] : null;

  return (
    <div className="ord-detail x-page">
      <Link to="/pedidos" className="ord-detail__back">
        <ArrowLeft aria-hidden="true" />
        Volver a pedidos
      </Link>

      <div className="ord-detail__layout">
        <div className="ord-detail__main">
          <section className="ord-detail__hero">
            <div className="ord-detail__heading">
              <div>
                <h2 className="ord-detail__code">{order.order_code}</h2>
                <p className="ord-detail__meta-line">
                  {isSupplier ? order.restaurant_name : order.supplier_name} · {formatDate(order.created_at)}
                </p>
              </div>
              <div className="ord-detail__badges">
                <span className={`x-badge ${orderStatusBadgeClass(order.status)}`}>
                  {orderStatusLabel(order.status)}
                </span>
                {order.payment_status === 'pagado' && (
                  <span className="x-badge x-badge--success">Pagado</span>
                )}
                {order.payment_status === 'pendiente' && (
                  <span className="x-badge x-badge--warn">Pago pendiente</span>
                )}
              </div>
            </div>

            <div className="ord-detail__items-block">
              <div className="ord-detail__items">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="ord-detail__num">Cantidad</th>
                      <th className="ord-detail__num">Precio</th>
                      <th className="ord-detail__num">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((i) => (
                      <tr key={i.id}>
                        <td data-label="Producto">{i.name}</td>
                        <td data-label="Cantidad" className="ord-detail__num">{i.quantity} {i.unit}</td>
                        <td data-label="Precio" className="ord-detail__num">{formatMoney(i.unit_price)}</td>
                        <td data-label="Subtotal" className="ord-detail__num">{formatMoney(i.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="ord-detail__total">
                <span>Total</span>
                <strong>{formatMoney(order.total)}</strong>
              </div>
            </div>

            {order.payment_status === 'pendiente' && (isGerente || user?.role === 'admin') && (
              <div className="ord-detail__pay">
                <span className="ord-detail__pay-icon" aria-hidden="true">
                  <CreditCard />
                </span>
                <div className="ord-detail__pay-copy">
                  <p className="ord-detail__pay-title">Este pedido requiere pago antes de confirmarse</p>
                  <p className="ord-detail__pay-text">
                    Pago seguro con Wompi: tarjeta, PSE o Nequi. Al aprobarse, el proveedor podrá confirmar el pedido.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={payOrder}
                  disabled={paying}
                  className="x-btn x-btn--primary"
                >
                  {paying ? 'Abriendo Wompi…' : `Pagar ${formatMoney(order.total)}`}
                </button>
              </div>
            )}

            <div className="ord-detail__facts">
              {order.notes && (
                <p className="ord-detail__fact">
                  <span className="ord-detail__fact-icon" aria-hidden="true"><StickyNote /></span>
                  <span><b>Notas: </b>{order.notes}</span>
                </p>
              )}
              {order.delivery_address && (
                <p className="ord-detail__fact">
                  <span className="ord-detail__fact-icon" aria-hidden="true"><MapPin /></span>
                  <span><b>Dirección de entrega: </b>{order.delivery_address}</span>
                </p>
              )}
              {order.requested_delivery_date && (
                <p className="ord-detail__fact">
                  <span className="ord-detail__fact-icon" aria-hidden="true"><CalendarClock /></span>
                  <span><b>Entrega solicitada: </b>{formatDate(order.requested_delivery_date)}</span>
                </p>
              )}
            </div>
          </section>

          {/* Tarjeta de seguimiento de entrega y domiciliario */}
          {latestDelivery && (
            <section className="ord-detail__delivery">
              <div className="ord-detail__delivery-head">
                <div className="ord-detail__delivery-id">
                  <span className="ord-detail__delivery-icon" aria-hidden="true"><Truck /></span>
                  <div>
                    <h3 className="ord-detail__delivery-title">Información y Estado de Entrega</h3>
                    <p className="ord-detail__guide">Guía: {latestDelivery.delivery_code}</p>
                  </div>
                </div>
                <span className="ord-detail__delivery-status">{latestDelivery.status}</span>
              </div>

              <div className="ord-detail__delivery-grid">
                <p className="ord-detail__data">
                  <b>Ubicación de entrega</b>
                  {latestDelivery.delivery_address || order.delivery_address || 'Bucaramanga, Santander'}
                </p>
                <p className="ord-detail__data">
                  <b>Quién lo lleva (Domiciliario)</b>
                  {latestDelivery.driver_name ? (
                    <span className="ord-detail__data-highlight">{latestDelivery.driver_name}</span>
                  ) : (
                    <span className="ord-detail__data-wait">Sin conductor asignado aún</span>
                  )}
                </p>
                {latestDelivery.driver_phone && (
                  <p className="ord-detail__data">
                    <b>Teléfono de contacto</b>
                    {latestDelivery.driver_phone}
                  </p>
                )}
                {latestDelivery.vehicle_name && (
                  <p className="ord-detail__data">
                    <b>Vehículo de despacho</b>
                    {latestDelivery.vehicle_name} ({latestDelivery.plate})
                  </p>
                )}
              </div>

              {/* Domiciliario: Vista destacada de la llave de entrega */}
              {isDriver && (
                <div className="ord-detail__key">
                  <span className="ord-detail__key-icon" aria-hidden="true"><KeyRound /></span>
                  <span className="ord-detail__key-label">
                    Tu Llave de Entrega:
                    <span className="ord-detail__key-value">
                      {latestDelivery.confirmation_code || '----'}
                    </span>
                  </span>
                  <p className="ord-detail__key-text">
                    Entrega este código al gerente del restaurante al llegar para que complete la entrega en su sistema.
                  </p>
                </div>
              )}

              {/* Gerente de Restaurante: Sección para validar con la llave recibida del domiciliario */}
              {(isGerente || (user?.restaurant_id && !isSupplier && !isDriver)) && (
                latestDelivery.status === 'entregado' ? (
                  <div className="ord-detail__success">
                    <CheckCircle2 aria-hidden="true" />
                    <span>Envío completado exitosamente a satisfacción con la llave de seguridad.</span>
                  </div>
                ) : (
                  <div className="ord-detail__confirm">
                    <div className="ord-detail__confirm-head">
                      <ShieldCheck aria-hidden="true" />
                      <div>
                        <h4 className="ord-detail__confirm-title">Completar Envío con Llave de Seguridad</h4>
                        <p className="ord-detail__confirm-text">
                          El domiciliario te entregará un código de 4 dígitos al momento de recibir el pedido. Ingrésalo a continuación para confirmar la recepción a satisfacción:
                        </p>
                      </div>
                    </div>
                    <div className="ord-detail__confirm-row">
                      <input
                        type="text"
                        maxLength={6}
                        value={securityKeyInput}
                        onChange={(e) => setSecurityKeyInput(e.target.value.trim())}
                        placeholder="Código (Ej: 7421)"
                        className="x-input ord-detail__code-input"
                        aria-label="Código de confirmación de entrega"
                      />
                      <button
                        type="button"
                        onClick={() => completeWithKey(latestDelivery.id)}
                        disabled={verifyingKey || !securityKeyInput.trim()}
                        className="x-btn x-btn--primary"
                      >
                        {verifyingKey ? 'Validando...' : 'Completar Envío con esta Llave'}
                      </button>
                    </div>
                    {keyError && <p className="ord-detail__error">{keyError}</p>}
                  </div>
                )
              )}

              {/* Acciones de entrega (El gerente NO ve mapa GPS; solo domiciliario o proveedor) */}
              <div className="ord-detail__actions">
                {!isGerente && (isDriver || isSupplier || user?.role === 'admin') && (
                  <Link to="/logistica" className="x-btn x-btn--primary">
                    <MapPinned aria-hidden="true" />
                    Ver en Mapa GPS en Tiempo Real
                  </Link>
                )}
                {canManageDelivery && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryForm({
                        driver_id: latestDelivery.driver_id ? String(latestDelivery.driver_id) : '',
                        vehicle_id: latestDelivery.vehicle_id ? String(latestDelivery.vehicle_id) : '',
                        scheduled_time: latestDelivery.scheduled_time || '',
                      });
                      setDeliveryModal(true);
                    }}
                    className="x-btn"
                  >
                    <Pencil aria-hidden="true" />
                    Cambiar Domiciliario / Vehículo
                  </button>
                )}
              </div>
            </section>
          )}

          <section className="x-card">
            <div className="x-card__head">
              <h3 className="x-card__title">Historial de Eventos</h3>
            </div>
            <div className="x-card__body">
              {history.length === 0 ? (
                <p className="ord-detail__empty">Sin eventos registrados.</p>
              ) : (
                <ul className="ord-detail__history-list">
                  {history.map((h, i) => (
                    <li key={i}>
                      <span>{h.action === 'create' ? 'Pedido creado' : `Cambio de estado: ${h.action}`}</span>
                      <time>{formatDate(h.created_at)}</time>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <aside className="ord-detail__side">
          <section className="ord-detail__side-card">
            <h3 className="ord-detail__side-title">
              <Package aria-hidden="true" />
              Gestión del Pedido
            </h3>

            {/* Botón directo para asignar domiciliario si aún no tiene */}
            {canManageDelivery && (!latestDelivery || !latestDelivery.driver_id) && !done && (
              <button
                type="button"
                onClick={() => setDeliveryModal(true)}
                className="x-btn x-btn--primary x-btn--block"
              >
                <UserPlus aria-hidden="true" />
                Asignar Domiciliario al Pedido
              </button>
            )}

            {isSupplier ? (
              <div className="ord-detail__flow">
                <p className="ord-detail__flow-label">Flujo de Estados</p>
                {SUPPLIER_FLOW.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => changeStatus(s)}
                    disabled={done || order.status === s || SUPPLIER_FLOW.indexOf(s) < SUPPLIER_FLOW.indexOf(order.status)}
                    className={`x-btn ord-detail__flow-btn ${order.status === s ? 'ord-detail__flow-btn--active' : ''}`}
                  >
                    Marcar como {orderStatusLabel(s)}
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => changeStatus('cancelado')}
                disabled={done}
                className="x-btn x-btn--danger x-btn--block"
              >
                Cancelar pedido
              </button>
            )}
            <p className="ord-detail__sync">Los cambios se sincronizan en tiempo real.</p>
          </section>
        </aside>
      </div>

      {deliveryModal && (
        <Modal title="Asignar Domiciliario y Programar Entrega" onClose={() => setDeliveryModal(false)}>
          <div className="ord-detail__modal-grid">
            <div>
              <label className="x-label" htmlFor="delivery-driver">Seleccionar Domiciliario / Conductor:</label>
              <select
                id="delivery-driver"
                value={deliveryForm.driver_id}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, driver_id: e.target.value })}
                className="x-select"
                required
              >
                <option value="">-- Elige un usuario del sistema --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.username}) · {d.role_label || d.role_name || 'Usuario'} {d.phone ? `· Tel: ${d.phone}` : ''}
                  </option>
                ))}
              </select>
              {drivers.length === 0 && (
                <span className="x-hint">No se encontraron usuarios registrados.</span>
              )}
            </div>
            <div>
              <label className="x-label" htmlFor="delivery-vehicle">Vehículo de Entrega (opcional):</label>
              <select
                id="delivery-vehicle"
                value={deliveryForm.vehicle_id}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, vehicle_id: e.target.value })}
                className="x-select"
              >
                <option value="">-- Sin vehículo específico asignado --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.plate}) · {v.type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="x-label" htmlFor="delivery-schedule">Fecha y hora estimada (opcional):</label>
              <input
                id="delivery-schedule"
                type="datetime-local"
                value={deliveryForm.scheduled_time}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, scheduled_time: e.target.value })}
                className="x-input"
              />
            </div>
            <button
              type="button"
              onClick={createDelivery}
              disabled={!deliveryForm.driver_id}
              className="x-btn x-btn--primary x-btn--block ord-detail__modal-actions"
            >
              Asignar Domiciliario y Guardar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
