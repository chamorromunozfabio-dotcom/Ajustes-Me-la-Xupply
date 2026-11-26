import { toast } from '../../../../shared/utils/feedback';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Minus, Plus, Settings2, ShoppingBasket, Store, Trash2 } from 'lucide-react';
import { useCart } from '../../../../shared/context/CartContext';
import { useNotifications } from '../../../../shared/context/NotificationContext';
import { api } from '../../../../shared/api/client';
import { Order } from '../../../../shared/types';
import { formatMoney } from '../../../../shared/utils/constants';
import { getProductImage } from '../../utils/productImage';
import '../../Catalog.css';

export default function CartPage() {
  const { items, setQuantity, remove, total, clear } = useCart();
  const { push } = useNotifications();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const groupBySupplier = () => {
    const map = new Map<number, typeof items>();
    for (const i of items) {
      const list = map.get(i.product.supplier_id) ?? [];
      list.push(i);
      map.set(i.product.supplier_id, list);
    }
    return [...map.entries()];
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      for (const [supplierId, list] of groupBySupplier()) {
        const itemCustomizations = list
          .filter((i) => i.customization)
          .map((i) => `• ${i.product.name}: ${i.customization}`)
          .join('\n');
        const finalNotes = [notes.trim(), itemCustomizations ? `Personalizaciones:\n${itemCustomizations}` : '']
          .filter(Boolean)
          .join('\n\n');

        const order = await api<Order>('/orders', {
          method: 'POST',
          body: JSON.stringify({
            supplier_id: supplierId,
            notes: finalNotes,
            delivery_address: deliveryAddress,
            items: list.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
          }),
        });
        if (!order.id) throw new Error('No se pudo crear el pedido');
      }
      push({ message: `Pedido creado para ${groupBySupplier().length} proveedor(es)`, at: new Date().toISOString() });
      clear();
      navigate('/pedidos');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart x-page">
        <div className="x-empty">
          <div className="x-empty__icon"><ShoppingBasket aria-hidden="true" className="w-6 h-6" /></div>
          <p className="x-empty__title">Tu carrito está vacío</p>
          <p className="x-empty__text">Agrega insumos desde el catálogo para comenzar tu pedido.</p>
          <button type="button" onClick={() => navigate('/catalogo')} className="x-btn x-btn--primary">
            Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart x-page">
      <header className="cat__hero">
        <div>
          <p className="cat__eyebrow">Comercio · Carrito</p>
          <h1 className="cat__title">Tu carrito</h1>
          <p className="cat__subtitle">
            {items.length} insumo(s) de {groupBySupplier().length} proveedor(es), listos para confirmar.
          </p>
        </div>
        <button type="button" onClick={() => navigate('/catalogo')} className="x-btn">
          <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5" />
          Seguir comprando
        </button>
      </header>

      <div className="cart__layout">
        <div className="cart__groups">
          {groupBySupplier().map(([supplierId, list]) => (
            <section key={supplierId} className="cart__group x-card">
              <div className="x-card__head">
                <h3 className="x-card__title">
                  <Store aria-hidden="true" className="cart__group-icon" />
                  {list[0].product.supplier_name || 'Proveedor oficial'}
                </h3>
                <span className="x-badge">{list.length} ítem(s)</span>
              </div>
              <div className="cart__items">
                {list.map((i) => (
                  <div key={i.product.id} className="cart__item">
                    <img
                      src={getProductImage(i.product)}
                      alt={i.product.name}
                      className="cart__item-img"
                    />
                    <div className="cart__item-info">
                      <p className="cart__item-name">{i.product.name}</p>
                      <p className="cart__item-price">{formatMoney(i.product.price_per_unit)} / {i.product.unit}</p>
                      {i.customization && (
                        <span className="cart__custom">
                          <Settings2 aria-hidden="true" className="w-3 h-3" />
                          {i.customization}
                        </span>
                      )}
                    </div>
                    <div className="cart__item-actions">
                      <div className="cart__stepper">
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          onClick={() => setQuantity(i.product.id, i.quantity - 1)}
                          className="cat__step-btn"
                        >
                          <Minus aria-hidden="true" />
                        </button>
                        <input
                          type="number"
                          aria-label={`Cantidad de ${i.product.name}`}
                          min={1}
                          value={i.quantity}
                          onChange={(e) => setQuantity(i.product.id, Math.max(1, Number(e.target.value)))}
                          className="cart__qty"
                        />
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          onClick={() => setQuantity(i.product.id, i.quantity + 1)}
                          className="cat__step-btn"
                        >
                          <Plus aria-hidden="true" />
                        </button>
                      </div>
                      <span className="cart__subtotal">{formatMoney(i.product.price_per_unit * i.quantity)}</span>
                      <button
                        type="button"
                        onClick={() => remove(i.product.id)}
                        className="cart__remove"
                        title="Eliminar producto"
                      >
                        <Trash2 aria-hidden="true" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="cart__summary x-card">
          <div className="x-card__head">
            <h2 className="x-card__title">Resumen del pedido</h2>
          </div>
          <div className="cart__summary-body">
            <div className="cart__total">
              <span>Total estimado</span>
              <strong>{formatMoney(total)}</strong>
            </div>
            <p className="cart__hint">El flete se coordina con el proveedor al confirmar.</p>

            <div>
              <label className="x-label" htmlFor="cart-address">
                <MapPin aria-hidden="true" className="cart__label-icon" />
                Dirección de entrega
              </label>
              <input
                id="cart-address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Carrera 27 # 45-12, Bucaramanga"
                className="x-input"
              />
            </div>
            <div>
              <label className="x-label" htmlFor="cart-notes">Notas para el pedido</label>
              <textarea
                id="cart-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones especiales de entrega"
                className="x-textarea"
                rows={2}
              />
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="x-btn x-btn--primary x-btn--block cat__submit"
            >
              {submitting ? 'Creando pedido...' : 'Crear pedido'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
