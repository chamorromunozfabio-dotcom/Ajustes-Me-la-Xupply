import { errorMessage, toast } from '../../../shared/utils/feedback';
import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('orders');
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
      setKeyError(t('detail.key_error'));
      return;
    }
    setVerifyingKey(true);
    setKeyError('');
    try {
      await api(`/deliveries/${deliveryId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ confirmation_code: securityKeyInput.trim() }),
      });
      push({ message: t('detail.completed'), at: new Date().toISOString() });
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
      push({ message: t('detail.order_updated', { status: orderStatusLabel(status, t) }), at: new Date().toISOString() });
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
      push({ message: t('detail.delivery_created'), at: new Date().toISOString() });
      setDeliveryModal(false);
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (!order) return <div className="x-empty">{t('detail.loading')}</div>;

  const done = ['entregado', 'cancelado'].includes(order.status);
  const latestDelivery = order.deliveries && order.deliveries.length > 0 ? order.deliveries[0] : null;

  const backTo = useLocation().pathname.startsWith('/mercado') ? '/mercado/pedidos' : '/pedidos';

  return (
    <div className="ord-detail x-page">
      <Link to={backTo} className="ord-detail__back">
        <ArrowLeft aria-hidden="true" />
        {t('detail.back')}
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
                  {orderStatusLabel(order.status, t)}
                </span>
                {order.payment_status === 'pagado' && (
                  <span className="x-badge x-badge--success">{t('detail.paid')}</span>
                )}
                {order.payment_status === 'pendiente' && (
                  <span className="x-badge x-badge--warn">{t('detail.pending_payment')}</span>
                )}
              </div>
            </div>

            <div className="ord-detail__items-block">
              <div className="ord-detail__items">
                <table>
                  <thead>
                    <tr>
                      <th>{t('detail.product')}</th>
                      <th className="ord-detail__num">{t('detail.quantity')}</th>
                      <th className="ord-detail__num">{t('detail.price')}</th>
                      <th className="ord-detail__num">{t('detail.subtotal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((i) => (
                      <tr key={i.id}>
                        <td data-label={t('detail.product')}>{i.name}</td>
                        <td data-label={t('detail.quantity')} className="ord-detail__num">{i.quantity} {i.unit}</td>
                        <td data-label={t('detail.price')} className="ord-detail__num">{formatMoney(i.unit_price)}</td>
                        <td data-label={t('detail.subtotal')} className="ord-detail__num">{formatMoney(i.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="ord-detail__total">
                <span>{t('detail.total')}</span>
                <strong>{formatMoney(order.total)}</strong>
              </div>
            </div>

            {order.payment_status === 'pendiente' && (isGerente || user?.role === 'admin') && (
              <div className="ord-detail__pay">
                <span className="ord-detail__pay-icon" aria-hidden="true">
                  <CreditCard />
                </span>
                <div className="ord-detail__pay-copy">
                  <p className="ord-detail__pay-title">{t('detail.pay_required')}</p>
                  <p className="ord-detail__pay-text">{t('detail.pay_text')}</p>
                </div>
                <button
                  type="button"
                  onClick={payOrder}
                  disabled={paying}
                  className="x-btn x-btn--primary"
                >
                  {paying ? t('detail.paying') : t('detail.pay', { amount: formatMoney(order.total) })}
                </button>
              </div>
            )}

            <div className="ord-detail__facts">
              {order.notes && (
                <p className="ord-detail__fact">
                  <span className="ord-detail__fact-icon" aria-hidden="true"><StickyNote /></span>
                  <span><b>{t('detail.notes')} </b>{order.notes}</span>
                </p>
              )}
              {order.delivery_address && (
                <p className="ord-detail__fact">
                  <span className="ord-detail__fact-icon" aria-hidden="true"><MapPin /></span>
                  <span><b>{t('detail.delivery_address')} </b>{order.delivery_address}</span>
                </p>
              )}
              {order.requested_delivery_date && (
                <p className="ord-detail__fact">
                  <span className="ord-detail__fact-icon" aria-hidden="true"><CalendarClock /></span>
                  <span><b>{t('detail.requested_delivery')} </b>{formatDate(order.requested_delivery_date)}</span>
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
                    <h3 className="ord-detail__delivery-title">{t('detail.delivery_info')}</h3>
                    <p className="ord-detail__guide">{t('detail.guide', { code: latestDelivery.delivery_code })}</p>
                  </div>
                </div>
                <span className="ord-detail__delivery-status">{latestDelivery.status}</span>
              </div>

              <div className="ord-detail__delivery-grid">
                <p className="ord-detail__data">
                  <b>{t('detail.delivery_location')}</b>
                  {latestDelivery.delivery_address || order.delivery_address || 'Bucaramanga, Santander'}
                </p>
                <p className="ord-detail__data">
                  <b>{t('detail.driver')}</b>
                  {latestDelivery.driver_name ? (
                    <span className="ord-detail__data-highlight">{latestDelivery.driver_name}</span>
                  ) : (
                    <span className="ord-detail__data-wait">{t('detail.no_driver')}</span>
                  )}
                </p>
                {latestDelivery.driver_phone && (
                  <p className="ord-detail__data">
                    <b>{t('detail.driver_phone')}</b>
                    {latestDelivery.driver_phone}
                  </p>
                )}
                {latestDelivery.vehicle_name && (
                  <p className="ord-detail__data">
                    <b>{t('detail.vehicle')}</b>
                    {latestDelivery.vehicle_name} ({latestDelivery.plate})
                  </p>
                )}
              </div>

              {/* Domiciliario: Vista destacada de la llave de entrega */}
              {isDriver && (
                <div className="ord-detail__key">
                  <span className="ord-detail__key-icon" aria-hidden="true"><KeyRound /></span>
                  <span className="ord-detail__key-label">
                    {t('detail.your_key')}
                    <span className="ord-detail__key-value">
                      {latestDelivery.confirmation_code || '----'}
                    </span>
                  </span>
                  <p className="ord-detail__key-text">{t('detail.key_hint')}</p>
                </div>
              )}

              {/* Gerente de Restaurante: Sección para validar con la llave recibida del domiciliario */}
              {(isGerente || (user?.restaurant_id && !isSupplier && !isDriver)) && (
                latestDelivery.status === 'entregado' ? (
                  <div className="ord-detail__success">
                    <CheckCircle2 aria-hidden="true" />
                    <span>{t('detail.completed')}</span>
                  </div>
                ) : (
                  <div className="ord-detail__confirm">
                    <div className="ord-detail__confirm-head">
                      <ShieldCheck aria-hidden="true" />
                      <div>
                        <h4 className="ord-detail__confirm-title">{t('detail.complete_with_key')}</h4>
                        <p className="ord-detail__confirm-text">{t('detail.complete_hint')}</p>
                      </div>
                    </div>
                    <div className="ord-detail__confirm-row">
                      <input
                        type="text"
                        maxLength={6}
                        value={securityKeyInput}
                        onChange={(e) => setSecurityKeyInput(e.target.value.trim())}
                        placeholder={t('detail.code_placeholder')}
                        className="x-input ord-detail__code-input"
                        aria-label={t('detail.code_placeholder')}
                      />
                      <button
                        type="button"
                        onClick={() => completeWithKey(latestDelivery.id)}
                        disabled={verifyingKey || !securityKeyInput.trim()}
                        className="x-btn x-btn--primary"
                      >
                        {verifyingKey ? t('detail.validating') : t('detail.complete_btn')}
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
                    {t('detail.view_map')}
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
                    {t('detail.change_driver')}
                  </button>
                )}
              </div>
            </section>
          )}

          <section className="x-card">
            <div className="x-card__head">
              <h3 className="x-card__title">{t('detail.history')}</h3>
            </div>
            <div className="x-card__body">
              {history.length === 0 ? (
                <p className="ord-detail__empty">{t('detail.no_events')}</p>
              ) : (
                <ul className="ord-detail__history-list">
                  {history.map((h, i) => (
                    <li key={i}>
                      <span>{h.action === 'create' ? t('detail.created') : t('detail.status_change', { status: h.action })}</span>
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
              {t('detail.management')}
            </h3>

            {/* Botón directo para asignar domiciliario si aún no tiene */}
            {canManageDelivery && (!latestDelivery || !latestDelivery.driver_id) && !done && (
              <button
                type="button"
                onClick={() => setDeliveryModal(true)}
                className="x-btn x-btn--primary x-btn--block"
              >
                <UserPlus aria-hidden="true" />
                {t('detail.assign_driver')}
              </button>
            )}

            {isSupplier ? (
              <div className="ord-detail__flow">
                <p className="ord-detail__flow-label">{t('detail.flow')}</p>
                {SUPPLIER_FLOW.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => changeStatus(s)}
                    disabled={done || order.status === s || SUPPLIER_FLOW.indexOf(s) < SUPPLIER_FLOW.indexOf(order.status)}
                    className={`x-btn ord-detail__flow-btn ${order.status === s ? 'ord-detail__flow-btn--active' : ''}`}
                  >
                    {t('detail.mark_as', { status: orderStatusLabel(s, t) })}
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
                {t('detail.cancel')}
              </button>
            )}
            <p className="ord-detail__sync">{t('detail.sync')}</p>
          </section>
        </aside>
      </div>

      {deliveryModal && (
        <Modal title={t('detail.assign_modal')} onClose={() => setDeliveryModal(false)}>
          <div className="ord-detail__modal-grid">
            <div>
              <label className="x-label" htmlFor="delivery-driver">{t('detail.select_driver')}</label>
              <select
                id="delivery-driver"
                value={deliveryForm.driver_id}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, driver_id: e.target.value })}
                className="x-select"
                required
              >
                <option value="">{t('detail.choose_user')}</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.username}) · {d.role_label || d.role_name || 'Usuario'} {d.phone ? `· Tel: ${d.phone}` : ''}
                  </option>
                ))}
              </select>
              {drivers.length === 0 && (
                <span className="x-hint">{t('detail.no_users')}</span>
              )}
            </div>
            <div>
              <label className="x-label" htmlFor="delivery-vehicle">{t('detail.vehicle_optional')}</label>
              <select
                id="delivery-vehicle"
                value={deliveryForm.vehicle_id}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, vehicle_id: e.target.value })}
                className="x-select"
              >
                <option value="">{t('detail.no_vehicle')}</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.plate}) · {v.type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="x-label" htmlFor="delivery-schedule">{t('detail.schedule_optional')}</label>
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
              {t('detail.save_assign')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
