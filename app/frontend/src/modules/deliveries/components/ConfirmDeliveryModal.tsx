import { CheckCircle2 } from 'lucide-react';
import Modal from '../../../shared/ui/Modal';

export default function ConfirmDeliveryModal({
  orderCode,
  code,
  onCodeChange,
  onConfirm,
  onClose,
}: {
  orderCode: string;
  code: string;
  onCodeChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={`Confirmar entrega ${orderCode}`} onClose={onClose}>
      <div className="dlv-modal">
        <p className="dlv-modal__hint">
          Solicita al cliente/restaurante el <b>código de confirmación de 4 dígitos</b> generado para este pedido:
        </p>
        <div>
          <label className="x-label" htmlFor="confirm-delivery-code">Código de confirmación</label>
          <input
            id="confirm-delivery-code"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="Ej: 4821"
            className="x-input dlv-modal__code"
            required
          />
        </div>
        <button
          type="button"
          onClick={onConfirm}
          disabled={code.length < 4}
          className="dlv-actions__btn dlv-actions__btn--done"
        >
          <CheckCircle2 aria-hidden="true" /> Validar y finalizar entrega
        </button>
      </div>
    </Modal>
  );
}
