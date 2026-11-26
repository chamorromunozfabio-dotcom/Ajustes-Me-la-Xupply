import { Truck } from 'lucide-react';
import { Vehicle } from '../../../shared/types';
import Modal from '../../../shared/ui/Modal';
import { VehicleGlyph, vehicleLabel } from '../../../shared/ui/VehicleBadge';
import { DriverOption } from '../types';

export default function AssignVehicleModal({
  vehicle,
  drivers,
  driverId,
  onDriverChange,
  onConfirm,
  onClose,
}: {
  vehicle: Vehicle;
  drivers: DriverOption[];
  driverId: string;
  onDriverChange: (driverId: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={`Asignar usuario a ${vehicle.name} (${vehicle.plate})`} onClose={onClose}>
      <div className="dlv-modal">
        <div className="dlv-modal__summary">
          <span className="dlv-modal__summary-icon">
            <VehicleGlyph type={vehicle.type} />
          </span>
          <div className="min-w-0">
            <p className="dlv-modal__summary-name">{vehicle.name}</p>
            <p className="dlv-modal__summary-meta">
              {vehicleLabel(vehicle.type)} · Placa: <b>{vehicle.plate}</b>
            </p>
          </div>
        </div>

        <div>
          <label className="x-label" htmlFor="assign-vehicle-driver">Seleccionar usuario / domiciliario</label>
          <select
            id="assign-vehicle-driver"
            value={driverId}
            onChange={(e) => onDriverChange(e.target.value)}
            className="x-select"
          >
            <option value="">-- Sin conductor asignado --</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.username}) · {d.role_label || d.role_name || 'Usuario'}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={onConfirm} className="x-btn x-btn--primary x-btn--block">
          <Truck aria-hidden="true" className="w-3.5 h-3.5" />
          Confirmar asignación vehicular
        </button>
      </div>
    </Modal>
  );
}
