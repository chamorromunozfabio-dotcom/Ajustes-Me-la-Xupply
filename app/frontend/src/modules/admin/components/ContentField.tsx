import { isExternalHttpUrl, isSafeLink } from '../../../shared/lib/safeValues';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export const LABELS: Record<string, string> = {
  appearance: 'Apariencia y animación',
  backgroundType: 'Tipo de fondo',
  backgroundColor: 'Color de fondo',
  backgroundImageUrl: 'URL de imagen de fondo',
  backgroundOverlayColor: 'Color del velo',
  backgroundOverlay: 'Opacidad del velo',
  brandColor: 'Color principal',
  brandDarkColor: 'Color principal oscuro',
  brandLightColor: 'Color principal claro',
  accentColor: 'Color de acento',
  textColor: 'Color del texto',
  mutedTextColor: 'Color de texto secundario',
  auroraEnabled: 'Aurora animada',
  auroraColors: 'Colores de la aurora',
  auroraOpacity: 'Opacidad de la aurora',
  auroraSpeed: 'Velocidad de la aurora',
  particlesEnabled: 'Partículas interactivas',
  particleColor: 'Color de las partículas',
  particleOpacity: 'Opacidad de las partículas',
  particleCount: 'Cantidad de partículas',
  nav: 'Menú superior',
  hero: 'Portada',
  marquee: 'Cinta de características',
  stats: 'Indicadores',
  features: 'Características',
  simulator: 'Simulador',
  roles: 'Roles',
  steps: 'Cómo funciona',
  comparison: 'Comparativa',
  testimonials: 'Testimonios',
  cta: 'Llamada a la acción',
  footer: 'Pie de página',
  banners: 'Banners',
  news: 'Noticias',
  statuses: 'Estados del pedido',
  words: 'Frases animadas',
  title: 'Título',
  subtitle: 'Subtítulo',
  label: 'Etiqueta',
  body: 'Texto',
  summary: 'Resumen',
  description: 'Descripción',
  name: 'Nombre',
  value: 'Valor',
  key: 'Clave',
  price: 'Precio',
  unit: 'Unidad',
  supplier: 'Proveedor',
  fefoDiscount: 'Descuento FEFO',
  image_url: 'URL de imagen (externa)',
  link_url: 'URL de enlace',
  date: 'Fecha',
  author: 'Autor',
  quote: 'Cita',
  role: 'Rol',
  titleLead: 'Título (inicio)',
  titleHighlight: 'Título (destacado)',
  primaryCta: 'Botón principal',
  secondaryCta: 'Botón secundario',
  ctaPrefix: 'Texto del botón de rol',
  actionLabel: 'Etiqueta de acción',
  simulateCta: 'Botón simular',
  completeCta: 'Botón entrega completada',
  mapTitle: 'Título del mapa',
  velLabel: 'Etiqueta velocidad',
  etaLabel: 'Etiqueta ETA',
  mapAriaLabel: 'Texto accesible del mapa',
  mapLabels: 'Etiquetas del mapa',
  warehouse: 'Bodega',
  restaurant: 'Restaurante',
  viaduct: 'Viaducto',
  typeLabel: 'Etiqueta de tipos',
  ingredientsLabel: 'Etiqueta de insumos',
  items: 'Elementos',
  rows: 'Filas',
  headers: 'Cabeceras',
  scrollHint: 'Pista de desplazamiento',
  highlights: 'Aspectos destacados',
  metrics: 'Métricas',
  mockupData: 'Datos de la consola',
  actionText: 'Texto de acción',
  contacts: 'Contactos',
  links: 'Enlaces',
  copyright: 'Copyright',
  creditsBefore: 'Créditos (antes)',
  creditsBetween: 'Créditos (entre)',
  authorOne: 'Autor 1',
  authorTwo: 'Autor 2',
  contactLabel: 'Etiqueta de contacto',
  contactEmail: 'Correo de contacto',
  location: 'Ubicación',
  stamp: 'Sello',
  issuer: 'Emisor',
  buyer: 'Adquirente',
  subtotal: 'Subtotal',
  savings: 'Ahorro',
  taxes: 'Impuestos',
  total: 'Total',
  cufeLabel: 'Etiqueta CUFE',
  submit: 'Botón emitir',
  success: 'Mensaje de éxito',
  decreaseLabel: 'Accesible: disminuir',
  increaseLabel: 'Accesible: aumentar',
  speed: 'Velocidad',
  eta: 'ETA',
  desc: 'Descripción del estado',
  time: 'Hora',
  chips: 'Chips',
  download: 'Botón de descarga',
  brand: 'Marca',
  productName: 'Nombre del producto',
  tagline: 'Frase secundaria (vacío = automática por rol)',
  logoImageUrl: 'URL del logo (externa)',
  showMark: 'Mostrar símbolo Xupply',
  showWordmark: 'Mostrar nombre al lado del símbolo',
  primaryColor: 'Color principal',
  primaryDarkColor: 'Color principal oscuro',
  primaryLightColor: 'Color principal claro',
  headerFrom: 'Color inicial de la barra',
  headerVia: 'Color medio de la barra',
  headerTo: 'Color final de la barra',
  headerTextColor: 'Color del texto de la barra',
  pageBackgroundLight: 'Fondo claro de la app',
  pageBackgroundDark: 'Fondo oscuro de la app',
  pageTextColor: 'Color del texto de la app',
  labels: 'Etiquetas de la interfaz',
  visibility: 'Elementos visibles',
  notice: 'Aviso global',
  enabled: 'Activo',
  text: 'Texto',
  linkLabel: 'Texto del enlace',
  showTopNav: 'Menú superior de accesos',
  showBottomNav: 'Menú inferior móvil',
  showCart: 'Botón del carrito',
  showLanguage: 'Cambio de idioma',
  showTheme: 'Cambio de tema',
  showNotifications: 'Campana de notificaciones',
  showBrandTagline: 'Frase bajo la marca',
  showUserChip: 'Datos del usuario en la barra',
  showLogout: 'Salida rápida',
  home: 'Inicio',
  catalog: 'Catálogo',
  orders: 'Pedidos',
  cart: 'Carrito',
  menu: 'Menú',
  logout: 'Cerrar sesión',
  panel: 'Panel',
  users: 'Usuarios',
  permissions: 'Permisos',
  audit: 'Auditoría',
  stores: 'Comercios',
  directory: 'Proveedores',
  clients: 'Clientes',
  myCatalog: 'Mi catálogo',
  myRoute: 'Mi ruta',
  dashboard: 'Dashboard',
  radar: 'Radar',
  verifications: 'Verificaciones',
  adminTagline: 'Etiqueta para admin',
  verifierTagline: 'Etiqueta para verificador',
  supplierTagline: 'Etiqueta para proveedor',
  driverTagline: 'Etiqueta para domiciliario',
  restaurantTagline: 'Etiqueta para restaurante',
};

export function humanize(key: string): string {
  if (LABELS[key]) return LABELS[key];
  return key
    .replace(/\.\w+$/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const COLOR_KEYS = new Set([
  'backgroundColor',
  'backgroundOverlayColor',
  'brandColor',
  'brandDarkColor',
  'brandLightColor',
  'accentColor',
  'textColor',
  'mutedTextColor',
  'particleColor',
  'headerFrom',
  'headerVia',
  'headerTo',
  'headerTextColor',
  'pageBackgroundLight',
  'pageBackgroundDark',
  'pageTextColor',
]);

const RANGES: Record<string, { min: number; max: number; step: number; unit: string }> = {
  backgroundOverlay: { min: 0, max: 100, step: 1, unit: '%' },
  auroraOpacity: { min: 0, max: 100, step: 1, unit: '%' },
  auroraSpeed: { min: 4, max: 90, step: 1, unit: ' s' },
  particleOpacity: { min: 0, max: 100, step: 1, unit: '%' },
  particleCount: { min: 0, max: 120, step: 1, unit: '' },
};

const SELECT_OPTIONS: Record<string, string[]> = {
  backgroundType: ['gradient', 'solid', 'image'],
};

const SELECT_LABELS: Record<string, Record<string, string>> = {
  backgroundType: { gradient: 'Degradado', solid: 'Color sólido', image: 'Imagen por URL' },
};

function isColorField(fieldKey: string): boolean {
  return COLOR_KEYS.has(fieldKey) || /color$/i.test(fieldKey) || /\.color$/i.test(fieldKey);
}

function isImageField(fieldKey: string): boolean {
  return fieldKey === 'image_url' || fieldKey === 'backgroundImageUrl' || fieldKey === 'logoImageUrl';
}

interface FieldProps {
  fieldKey: string;
  label: string;
  value: JsonValue;
  onChange: (value: JsonValue) => void;
}

/** Editor contextual: color, URL externa, select, rango, texto y listas anidadas. */
export function ContentField({ fieldKey, label, value, onChange }: FieldProps) {
  if (typeof value === 'string') {
    const selectOptions = SELECT_OPTIONS[fieldKey];
    if (selectOptions) {
      return (
        <label className="ce-field">
          {label ? <span className="ce-field__label">{label}</span> : null}
          <select
            className="ce-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {selectOptions.map((option) => (
              <option key={option} value={option}>
                {SELECT_LABELS[fieldKey]?.[option] ?? option}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (isColorField(fieldKey)) {
      return (
        <label className="ce-field">
          {label ? <span className="ce-field__label">{label}</span> : null}
          <span className="ce-color">
            <input
              type="color"
              aria-label={`Selector de ${label || fieldKey}`}
              value={/^#[\da-f]{6}$/i.test(value) ? value : '#0284c7'}
              onChange={(e) => onChange(e.target.value)}
            />
            <input
              className="ce-input ce-input--mono"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </span>
        </label>
      );
    }

    if (isImageField(fieldKey)) {
      const valid = isExternalHttpUrl(value);
      return (
        <label className="ce-field">
          {label ? <span className="ce-field__label">{label}</span> : null}
          <input
            className="ce-input"
            type="url"
            placeholder="https://ejemplo.com/imagen.webp"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {value ? (
            valid ? (
              <span className="ce-image-preview">
                <img
                  src={value}
                  alt="Vista previa"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <a href={value} target="_blank" rel="noreferrer">Abrir imagen ↗</a>
              </span>
            ) : (
              <span className="ce-field__hint ce-field__hint--warn">
                Usa una URL pública http(s). El CMS no sube archivos.
              </span>
            )
          ) : (
            <span className="ce-field__hint">Pega una URL pública http(s) de la imagen.</span>
          )}
        </label>
      );
    }

    if (fieldKey === 'link_url' || fieldKey === 'linkUrl') {
      const valid = !value || isSafeLink(value);
      return (
        <label className="ce-field">
          {label ? <span className="ce-field__label">{label}</span> : null}
          <input
            className="ce-input"
            type="text"
            placeholder="/register o https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => {
              // No se publica un enlace inseguro: se descarta al salir del campo.
              if (e.target.value.trim() && !isSafeLink(e.target.value)) onChange('');
            }}
          />
          {!valid ? <span className="ce-field__hint ce-field__hint--warn">Usa /ruta o una URL http(s).</span> : null}
        </label>
      );
    }

    const long = value.length > 90 || /\n/.test(value);
    return (
      <label className="ce-field">
        {label ? <span className="ce-field__label">{label}</span> : null}
        {long ? (
          <textarea
            className="ce-input"
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className="ce-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </label>
    );
  }

  if (typeof value === 'number') {
    const range = RANGES[fieldKey];
    if (range) {
      const safe = Number.isFinite(value) ? value : range.min;
      return (
        <label className="ce-field">
          <span className="ce-field__label">
            {label} <b className="ce-field__value">{safe}{range.unit}</b>
          </span>
          <input
            className="ce-range"
            type="range"
            min={range.min}
            max={range.max}
            step={range.step}
            value={safe}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </label>
      );
    }
    return (
      <label className="ce-field">
        {label ? <span className="ce-field__label">{label}</span> : null}
        <input
          className="ce-input"
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <label className="ce-switch">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="ce-switch__track" aria-hidden="true"><i /></span>
        <span>{label}</span>
      </label>
    );
  }

  if (Array.isArray(value)) {
    const colorList = /colors$/i.test(fieldKey);
    return (
      <div className="ce-array">
        {label ? <p className="ce-array__title">{label} <span>({value.length})</span></p> : null}
        {value.map((item, index) => (
          <div className="ce-array__item" key={index}>
            <div className="ce-array__item-head">
              <span>#{index + 1}</span>
              <button
                type="button"
                className="ce-btn ce-btn--danger"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                Eliminar
              </button>
            </div>
            <ContentField
              fieldKey={colorList ? `${fieldKey}.color` : `${fieldKey}.item`}
              label={colorList ? `Color ${index + 1}` : ''}
              value={item}
              onChange={(next) => onChange(value.map((old, i) => (i === index ? next : old)))}
            />
          </div>
        ))}
        <button
          type="button"
          className="ce-btn ce-btn--add"
          onClick={() => onChange([...value, value.length ? clone(value[value.length - 1]) : ''])}
        >
          + Agregar elemento
        </button>
      </div>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <div className="ce-object">
        {Object.entries(value).map(([key, child]) => (
          <ContentField
            key={key}
            fieldKey={key}
            label={humanize(key)}
            value={child}
            onChange={(next) => onChange({ ...value, [key]: next } as JsonValue)}
          />
        ))}
      </div>
    );
  }

  return null;
}
