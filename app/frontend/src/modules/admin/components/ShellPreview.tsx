import { Bell, Home, Menu, Moon, Package, Search, ShoppingCart } from 'lucide-react';
import { getShellAppearanceStyle } from '../../../shared/lib/shellAppearance';
import { isExternalHttpUrl } from '../../../shared/lib/safeValues';
import type { ShellContent } from '../../../shared/lib/shellContent';

interface Props {
  content: ShellContent;
}

export function ShellPreview({ content }: Props) {
  const { brand, appearance, visibility, notice } = content;
  const logo = isExternalHttpUrl(brand.logoImageUrl) ? brand.logoImageUrl : '';

  return (
    <div className="sp" style={getShellAppearanceStyle(appearance)}>
      {notice.enabled && notice.text.trim() ? (
        <div className="sp__notice">
          <span>{notice.text}</span>
          {notice.linkLabel.trim() ? <b>{notice.linkLabel}</b> : null}
        </div>
      ) : null}

      <div className="sp__page">
        <div className="sp__header">
          <div className="sp__brand">
            {logo ? <img src={logo} alt={brand.productName} /> : null}
            {brand.showMark && !logo ? <span className="sp__mark">X</span> : null}
            <div>
              <b>{brand.productName}</b>
              {visibility.showBrandTagline && brand.tagline ? <small>{brand.tagline}</small> : null}
            </div>
          </div>
          {visibility.showTopNav ? (
            <div className="sp__nav">
              <span className="sp__active">{content.labels.home || 'Inicio'}</span>
              <span>{content.labels.catalog || 'Catálogo'}</span>
              <span>{content.labels.orders || 'Pedidos'}</span>
            </div>
          ) : null}
          <div className="sp__actions">
            {visibility.showCart ? <i><ShoppingCart size={11} /></i> : null}
            {visibility.showNotifications ? <i><Bell size={11} /></i> : null}
            {visibility.showLanguage ? <i>ES</i> : null}
            {visibility.showTheme ? <i><Moon size={11} /></i> : null}
            <b>{content.labels.menu || 'Menú'}</b>
          </div>
        </div>

        <div className="sp__body">
          <p className="sp__eyebrow">Vista de la app para cualquier rol</p>
          <div className="sp__card">
            <b>Pedidos recientes</b>
            <span>Los colores del encabezado, fondo y botones se aplican en todas las vistas.</span>
            <div className="sp__buttons">
              <i className="sp__button">{content.labels.orders || 'Pedidos'}</i>
              <i className="sp__button sp__button--ghost">{content.labels.cart || 'Carrito'}</i>
            </div>
          </div>
          <div className="sp__swatches">
            {[
              appearance.primaryColor,
              appearance.primaryDarkColor,
              appearance.primaryLightColor,
              appearance.accentColor,
              appearance.headerFrom,
            ].map((color, index) => (
              <span key={index} style={{ background: color }} title={color} />
            ))}
          </div>
        </div>

        {visibility.showBottomNav ? (
          <div className="sp__bottom">
            <span className="sp__bottom-active"><Home size={10} /> {content.labels.dashboard || 'Dashboard'}</span>
            <span><Search size={10} /> {content.labels.catalog || 'Catálogo'}</span>
            <span><Package size={10} /> {content.labels.orders || 'Pedidos'}</span>
            <span><Menu size={10} /> {content.labels.menu || 'Menú'}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
