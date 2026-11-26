import { Plus, Truck } from 'lucide-react';
import { Vehicle } from '../../../shared/types';
import { VehicleGlyph, vehicleLabel } from '../../../shared/ui/VehicleBadge';

export default function FleetPanel({
  vehicles,
  onNewVehicle,
  onAssignVehicle,
}: {
  vehicles: Vehicle[];
  onNewVehicle: () => void;
  onAssignVehicle: (vehicle: Vehicle) => void;
}) {
  return (
    <section className="dlv-fleet">
      <div className="dlv-fleet__head">
        <div>
          <h3 className="dlv-fleet__title">
            <Truck aria-hidden="true" />
            Flota registrada ({vehicles.length})
          </h3>
          <p className="dlv-fleet__subtitle">
            Asigna camiones o motos a los usuarios y domiciliarios de tu equipo de entrega.
          </p>
        </div>
        <button type="button" onClick={onNewVehicle} className="x-btn x-btn--primary x-btn--sm">
          <Plus aria-hidden="true" className="w-3.5 h-3.5" />
          Nuevo vehículo
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="dlv-fleet__empty">
          No hay vehículos registrados. Pulsa «Nuevo vehículo» para dar de alta camiones o motos.
        </div>
      ) : (
        <div className="dlv-fleet__grid">
          {vehicles.map((v) => (
            <article key={v.id} className="dlv-vehicle">
              <div className="dlv-vehicle__head">
                <div className="dlv-vehicle__id">
                  <span className="dlv-vehicle__icon">
                    <VehicleGlyph type={v.type} />
                  </span>
                  <div className="min-w-0">
                    <p className="dlv-vehicle__name">{v.name}</p>
                    <span className="dlv-vehicle__plate">{v.plate || 'SIN PLACA'}</span>
                  </div>
                </div>
                <span className="dlv-vehicle__type">{vehicleLabel(v.type)}</span>
              </div>

              <div className="dlv-vehicle__foot">
                <span className="dlv-vehicle__driver">
                  Conductor: <b>{v.driver_name || 'Sin asignar'}</b>
                </span>
                <button type="button" onClick={() => onAssignVehicle(v)} className="dlv-vehicle__assign">
                  Asignar usuario
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
