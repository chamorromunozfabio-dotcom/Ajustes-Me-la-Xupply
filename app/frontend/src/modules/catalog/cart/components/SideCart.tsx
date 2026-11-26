import { toast } from '../../../../shared/utils/feedback';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Minus, Plus, ShoppingBasket, Store, Trash2, X } from 'lucide-react';
import { useCart } from '../../../../shared/context/CartContext';
import { useNotifications } from '../../../../shared/context/NotificationContext';
import { api } from '../../../../shared/api/client';
import { Order } from '../../../../shared/types';
import { formatMoney } from '../../../../shared/utils/constants';
import { getProductImage } from '../../utils/productImage';
import '../../Catalog.css';

export default function SideCart() {
  const { items, setQuantity, remove, total, count, isOpen, closeCart, clear } = useCart();
  const { push } = useNotifications();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const groupBySupplier = () => {
    const map = new Map<number, typeof items>();
    for (const i of items) {
      const list = map.get(i.product.supplier_id) ?? [];
      list.push(i);
      map.set(i.product.supplier_id, list);
    }
    return [...map.entries()];
  };

  const submitOrder = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const suppliers = groupBySupplier();
      for (const [supplierId, list] of suppliers) {
        const order = await api<Order>('/orders', {
          method: 'POST',
          body: JSON.stringify({
            supplier_id: supplierId,
            notes,
            delivery_address: deliveryAddress,
            items: list.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
          }),
        });
        if (!order.id) throw new Error('No se pudo generar el pedido con el proveedor');
      }
      push({
        message: `Pedido generado exitosamente para ${suppliers.length} proveedor(es)`,
        at: new Date().toISOString(),
      });
      clear();
      closeCart();
      navigate('/pedidos');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="scart">
      {/* Telón de fondo con desenfoque suave */}
      <button
        type="button"
        className="scart__backdrop"
        onClick={closeCart}
        aria-label="Cerrar carrito"
      />

      <div className="scart__panel">
        {/* Cabecera del Drawer */}
        <header className="scart__head">
          <div className="scart__head-main">
            <span className="scart__head-icon" aria-hidden="true"><ShoppingBasket /></span>
            <div className="min-w-0">
              <h2 className="scart__head-title">Carrito de compras</h2>
              <p className="scart__head-sub">
                {count} {count === 1 ? 'artículo' : 'artículos'} seleccionados
              </p>
            </div>
          </div>
          <button type="button" onClick={closeCart} className="scart__close" aria-label="Cerrar carrito">
            <X aria-hidden="true" />
          </button>
        </header>

        {/* Lista de Productos del Carrito */}
        <div className="scart__body">
          {items.length === 0 ? (
            <div className="x-empty scart__empty">
              <div className="x-empty__icon"><ShoppingBasket aria-hidden="true" className="w-7 h-7" /></div>
              <p className="x-empty__title">Tu carrito está vacío</p>
              <p className="x-empty__text">Agrega insumos desde el catálogo de proveedores para comenzar tu orden.</p>
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  navigate('/catalogo');
                }}
                className="x-btn x-btn--primary"
              >
                Explorar catálogo
              </button>
            </div>
          ) : (
            <>
              {groupBySupplier().map(([supplierId, list]) => (
                <section key={supplierId} className="scart__group">
                  <div className="scart__group-head">
                    <Store aria-hidden="true" className="scart__group-icon" />
                    <h3 className="scart__group-title">
                      {list[0].product.supplier_name || 'Proveedor Oficial'}
                    </h3>
                    <span className="scart__group-count">
                      {list.length} {list.length === 1 ? 'ítem' : 'ítems'}
                    </span>
                  </div>

                  <div className="scart__items">
                    {list.map((item) => (
                      <div key={item.product.id} className="scart__item">
                        <img
                          src={getProductImage(item.product)}
                          alt={item.product.name}
                          className="scart__item-img"
                        />
                        <div className="scart__item-info">
                          <p className="scart__item-name">{item.product.name}</p>
                          <p className="scart__item-price">
                            {formatMoney(item.product.price_per_unit)} / {item.product.unit}
                          </p>
                        </div>
                        <div className="scart__item-controls">
                          <div className="scart__stepper">
                            <button
                              type="button"
                              aria-label="Disminuir cantidad"
                              onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                              className="scart__step-btn"
                            >
                              <Minus aria-hidden="true" />
                            </button>
                            <span className="scart__qty">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label="Aumentar cantidad"
                              onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                              className="scart__step-btn"
                            >
                              <Plus aria-hidden="true" />
                            </button>
                          </div>
                          <span className="scart__subtotal">
                            {formatMoney(item.product.price_per_unit * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(item.product.id)}
                            className="scart__remove"
                            title="Quitar producto"
                          >
                            <Trash2 aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {/* Campos de Despacho y Notas */}
              <div className="scart__fields">
                <h4 className="scart__fields-title">Detalles de entrega</h4>
                <div>
                  <label className="x-label" htmlFor="scart-address">
                    <MapPin aria-hidden="true" className="cart__label-icon" />
                    Dirección de envío
                  </label>
                  <input
                    id="scart-address"
                    type="text"
                    placeholder="Ej. Carrera 27 # 45-12, Bucaramanga"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="x-input"
                  />
                </div>
                <div>
                  <label className="x-label" htmlFor="scart-notes">Instrucciones o notas especiales</label>
                  <textarea
                    id="scart-notes"
                    rows={2}
                    placeholder="Ej. Entregar en recepción o llamar antes de llegar"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="x-textarea"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pie Fijo con Resumen y Botón de Confirmación */}
        {items.length > 0 && (
          <footer className="scart__foot">
            <div className="scart__totals">
              <div><span>Subtotal productos</span><span>{formatMoney(total)}</span></div>
              <div><span>Logística y transporte</span><span className="scart__shipping">Coordinado en ruta</span></div>
              <div className="scart__grand"><span>Total estimado</span><strong>{formatMoney(total)}</strong></div>
            </div>

            <button
              type="button"
              onClick={submitOrder}
              disabled={submitting}
              className="x-btn x-btn--primary x-btn--block scart__submit"
            >
              {submitting ? (
                <>
                  <span className="scart__spinner" aria-hidden="true" />
                  Transmitiendo Pedido...
                </>
              ) : (
                <>
                  Confirmar y Despachar Pedido
                  <ArrowRight aria-hidden="true" className="w-4 h-4" />
                </>
              )}
            </button>

            <button type="button" onClick={closeCart} className="scart__continue">
              Continuar comprando
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
