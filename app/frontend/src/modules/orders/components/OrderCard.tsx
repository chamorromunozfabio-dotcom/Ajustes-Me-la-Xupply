import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Navigation, Package, Store } from 'lucide-react';
import { Order } from '../../../shared/types';
import { formatMoney, formatDate } from '../../../shared/utils/constants';
import { orderStatusBadgeClass, orderStatusLabel } from '../presentation';
import '../Orders.css';

export default function OrderCard({ order, isSupplier }: { order: Order; isSupplier: boolean }) {
  const statusClass = orderStatusBadgeClass(order.status);
  const PartyIcon = isSupplier ? Store : Package;

  return (
    <Link to={`/pedidos/${order.id}`} className="ord-card x-card--hover">
      <span className="ord-card__icon" aria-hidden="true">
        <PartyIcon />
      </span>

      <span className="ord-card__main">
        <span className="ord-card__code">{order.order_code}</span>
        <span className="ord-card__party">{isSupplier ? order.restaurant_name : order.supplier_name}</span>
      </span>

      <span className="ord-card__side">
        <span className={`x-badge ${statusClass}`}>{orderStatusLabel(order.status)}</span>
        <span className="ord-card__total">{formatMoney(order.total)}</span>
      </span>

      <ChevronRight className="ord-card__chevron" aria-hidden="true" />

      <span className="ord-card__footer">
        <span className="ord-card__detail">
          <CalendarDays aria-hidden="true" />
          {formatDate(order.created_at)}
          {order.items?.length ? ` · ${order.items.length} producto(s)` : ''}
        </span>
        {['despachado', 'en_camino'].includes(order.status) && (
          <span className="ord-card__route">
            <span className="ord-card__route-dot" aria-hidden="true" />
            <Navigation aria-hidden="true" className="w-3 h-3" />
            En ruta GPS
          </span>
        )}
      </span>
    </Link>
  );
}
