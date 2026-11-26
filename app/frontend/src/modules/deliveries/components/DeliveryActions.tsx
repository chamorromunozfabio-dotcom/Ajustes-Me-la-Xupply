import { CheckCircle2, KeyRound, MapPin, Play, UserRoundPlus } from 'lucide-react';
import { Delivery } from '../../../shared/types';

export default function DeliveryActions({
  selected,
  isDriver,
  canManage,
  onStatusChange,
  onConfirm,
  onAssign,
}: {
  selected: Delivery;
  isDriver: boolean;
  canManage: boolean;
  onStatusChange: (id: number, status: string) => void;
  onConfirm: () => void;
  onAssign: () => void;
}) {
  return (
    <div className="dlv-actions">
      {isDriver && (
        <>
          {selected.confirmation_code && (
            <div className="dlv-actions__key">
              <span className="dlv-actions__key-label">
                <KeyRound aria-hidden="true" /> Llave de seguridad
              </span>
              <div className="dlv-actions__code">{selected.confirmation_code}</div>
              <p className="dlv-actions__hint">Dicta este código al gerente para completar la entrega.</p>
            </div>
          )}

          {selected.status === 'asignado' && (
            <button
              type="button"
              onClick={() => onStatusChange(selected.id, 'en_camino')}
              className="dlv-actions__btn dlv-actions__btn--start"
            >
              <Play aria-hidden="true" /> Iniciar viaje
            </button>
          )}
          {selected.status === 'en_camino' && (
            <button
              type="button"
              onClick={() => onStatusChange(selected.id, 'llegando')}
              className="dlv-actions__btn dlv-actions__btn--arrive"
            >
              <MapPin aria-hidden="true" /> Estoy llegando al destino
            </button>
          )}
          {selected.status !== 'entregado' && (
            <button type="button" onClick={onConfirm} className="dlv-actions__btn dlv-actions__btn--done">
              <CheckCircle2 aria-hidden="true" /> Confirmar entrega con código
            </button>
          )}
        </>
      )}

      {canManage && (
        <button type="button" onClick={onAssign} className="dlv-actions__btn dlv-actions__btn--assign">
          <UserRoundPlus aria-hidden="true" /> Asignar / cambiar domiciliario
        </button>
      )}
    </div>
  );
}
