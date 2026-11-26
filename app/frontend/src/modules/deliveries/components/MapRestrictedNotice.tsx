import { Link } from 'react-router-dom';
import { ArrowRight, MapPinned } from 'lucide-react';

export default function MapRestrictedNotice() {
  return (
    <div className="dlv-restricted">
      <div className="dlv-restricted__icon">
        <MapPinned aria-hidden="true" />
      </div>
      <h2 className="dlv-restricted__title">Visualización de mapa GPS restringida</h2>
      <p className="dlv-restricted__text">
        Por políticas de privacidad y seguridad logística, los gerentes de restaurantes no visualizan el mapa GPS satelital de la flota de despacho.
      </p>
      <div className="dlv-restricted__card">
        <p className="dlv-restricted__card-title">¿Cómo verificar el estado de tu pedido?</p>
        <ul className="dlv-restricted__list">
          <li>Ingresa a la sección <b>Pedidos</b> y haz clic sobre tu orden activa.</li>
          <li>En la información del pedido podrás ver el <b>estado del despacho, la ubicación de entrega y quién lo lleva</b> (nombre del domiciliario, teléfono y vehículo).</li>
          <li>Al recibir tu pedido en el restaurante, el domiciliario te entregará la <b>Llave de Seguridad</b> para confirmar la entrega con el código.</li>
        </ul>
      </div>
      <div className="dlv-restricted__cta">
        <Link to="/pedidos" className="x-btn x-btn--primary">
          Ir a mis pedidos
          <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
