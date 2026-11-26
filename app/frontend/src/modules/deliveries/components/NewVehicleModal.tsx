import { Save } from 'lucide-react';
import Modal from '../../../shared/ui/Modal';
import { VehicleGlyph } from '../../../shared/ui/VehicleBadge';
import { DriverOption, VehicleFormState } from '../types';

export default function NewVehicleModal({
  form,
  drivers,
  onChange,
  onDriverChange,
  onCreate,
  onClose,
}: {
  form: VehicleFormState;
  drivers: DriverOption[];
  onChange: (patch: Partial<VehicleFormState>) => void;
  onDriverChange: (driverId: string) => void;
  onCreate: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Registrar nuevo vehículo (camión / moto)" onClose={onClose}>
      <div className="dlv-modal">
        <div>
          <span className="x-label">Tipo de vehículo *</span>
          <div className="dlv-types">
            {[
              { id: 'camion', label: 'Camión', desc: 'Carga pesada' },
              { id: 'moto', label: 'Moto', desc: 'Repartos ágiles' },
              { id: 'furgon', label: 'Furgón', desc: 'Seco / Frío' },
              { id: 'camioneta', label: 'Camioneta', desc: 'Utilitario' },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onChange({ type: item.id })}
                className={`dlv-type ${form.type === item.id ? 'dlv-type--active' : ''}`}
              >
                <span className="dlv-type__head">
                  <VehicleGlyph type={item.id} />
                  <span>{item.label}</span>
                </span>
                <span className="dlv-type__desc">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="x-label" htmlFor="vehicle-name">Nombre o identificador *</label>
          <input
            id="vehicle-name"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ej: Camión Norte 1, Moto Express 2"
            className="x-input"
            required
          />
        </div>

        <div>
          <label className="x-label" htmlFor="vehicle-plate">Placa del vehículo *</label>
          <input
            id="vehicle-plate"
            value={form.plate}
            onChange={(e) => onChange({ plate: e.target.value.toUpperCase() })}
            placeholder="Ej: ABC-123"
            className="x-input"
            required
          />
        </div>

        <div>
          <label className="x-label" htmlFor="vehicle-driver">Asignar a usuario / conductor</label>
          <select
            id="vehicle-driver"
            value={form.driver_id}
            onChange={(e) => onDriverChange(e.target.value)}
            className="x-select"
          >
            <option value="">-- Sin conductor asignado (asignar luego) --</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.username}) · {d.role_label || d.role_name || 'Usuario'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="x-label" htmlFor="vehicle-imei">IMEI del GPS (opcional)</label>
          <input
            id="vehicle-imei"
            value={form.imei}
            onChange={(e) => onChange({ imei: e.target.value })}
            placeholder="IMEI del GPS (15 dígitos, opcional)"
            className="x-input"
          />
        </div>

        <button
          type="button"
          onClick={onCreate}
          disabled={!form.name.trim() || !form.plate.trim()}
          className="x-btn x-btn--primary x-btn--block"
        >
          <Save aria-hidden="true" className="w-3.5 h-3.5" />
          Guardar y registrar vehículo
        </button>
      </div>
    </Modal>
  );
}
