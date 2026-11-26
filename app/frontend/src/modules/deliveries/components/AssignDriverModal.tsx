import { UserRoundPlus } from 'lucide-react';
import { Vehicle } from '../../../shared/types';
import Modal from '../../../shared/ui/Modal';
import { DriverOption } from '../types';

export default function AssignDriverModal({
  orderCode,
  drivers,
  vehicles,
  selectedDriverId,
  selectedVehicleId,
  assignmentLoadError,
  onDriverChange,
  onVehicleChange,
  onAssign,
  onClose,
}: {
  orderCode: string;
  drivers: DriverOption[];
  vehicles: Vehicle[];
  selectedDriverId: string;
  selectedVehicleId: string;
  assignmentLoadError: string;
  onDriverChange: (driverId: string) => void;
  onVehicleChange: (vehicleId: string) => void;
  onAssign: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={`Asignar domiciliario a ${orderCode}`} onClose={onClose}>
      <div className="dlv-modal">
        <div>
          <label className="x-label" htmlFor="assign-driver">Seleccionar domiciliario</label>
          <select
            id="assign-driver"
            value={selectedDriverId}
            onChange={(e) => onDriverChange(e.target.value)}
            className="x-select"
          >
            <option value="">-- Elige un domiciliario --</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.username}) {d.phone ? `· Tel: ${d.phone}` : ''}
              </option>
            ))}
          </select>
          {drivers.length === 0 && (
            <p className="dlv-modal__notice">No hay domiciliarios activos registrados para este proveedor.</p>
          )}
        </div>

        <div>
          <label className="x-label" htmlFor="assign-vehicle">Vehículo para la entrega</label>
          <select
            id="assign-vehicle"
            value={selectedVehicleId}
            onChange={(e) => onVehicleChange(e.target.value)}
            disabled={!selectedDriverId}
            className="x-select"
          >
            <option value="">-- Elige un vehículo --</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name} · {vehicle.plate} ({vehicle.type})
                {vehicle.driver_name ? ` · Conductor: ${vehicle.driver_name}` : ' · Sin conductor asignado'}
              </option>
            ))}
          </select>
          {assignmentLoadError ? (
            <p className="dlv-modal__error">{assignmentLoadError}</p>
          ) : vehicles.length === 0 ? (
            <p className="dlv-modal__notice">No hay vehículos activos en la flota. Registra uno antes de asignar la entrega.</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onAssign}
          disabled={!selectedDriverId || !selectedVehicleId || Boolean(assignmentLoadError)}
          className="x-btn x-btn--primary x-btn--block"
        >
          <UserRoundPlus aria-hidden="true" className="w-3.5 h-3.5" />
          Asignar y notificar al domiciliario
        </button>
      </div>
    </Modal>
  );
}
