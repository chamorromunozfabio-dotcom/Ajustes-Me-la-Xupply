import { History } from 'lucide-react';
import { Delivery } from '../../../shared/types';
import { DELIVERY_STATUS, formatDate } from '../../../shared/utils/constants';

export default function DeliveryHistory({
  deliveries,
  canShowCodes,
  onSelect,
}: {
  deliveries: Delivery[];
  canShowCodes: boolean;
  onSelect: (delivery: Delivery) => void;
}) {
  return (
    <section className="dlv-history">
      <h3 className="dlv-history__title">
        <History aria-hidden="true" />
        Historial general de entregas
      </h3>

      {deliveries.length === 0 ? (
        <div className="dlv-history__empty">Todavía no hay entregas registradas.</div>
      ) : (
        deliveries.map((d) => {
          const st = DELIVERY_STATUS[d.status] ?? { label: d.status, color: 'bg-gray-100 text-gray-700' };
          return (
            <div
              key={d.id}
              onClick={() => onSelect(d)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onSelect(d);
              }}
              className="dlv-history__row"
            >
              <div className="dlv-history__main">
                <p className="dlv-history__code">
                  {d.delivery_code} <span>· Pedido {d.order_code}</span>
                </p>
                <p className="dlv-history__meta">
                  {d.restaurant_name} · {d.delivery_address}
                </p>
                <p className="dlv-history__detail">
                  {d.driver_name ? `Conductor: ${d.driver_name}` : 'Sin conductor'}
                  {d.vehicle_name ? ` · Vehículo: ${d.vehicle_name} (${d.plate})` : ''}
                  {d.scheduled_time ? ` · Programada: ${formatDate(d.scheduled_time)}` : ''}
                </p>
              </div>
              <div className="dlv-history__side">
                <span className={`dlv-history__badge ${st.color}`}>{st.label}</span>
                {d.confirmation_code && canShowCodes && (
                  <p className="dlv-history__secret">
                    Código: <b>{d.confirmation_code}</b>
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
