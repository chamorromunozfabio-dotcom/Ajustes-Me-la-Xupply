/**
 * Contenido editable de la landing.
 *
 * Es el único bloque que consume el mini-CMS (`site_content`, slug
 * `landing.content`). Los componentes de la landing leen de aquí y el panel
 * del rol Técnico edita exactamente este mismo objeto, por lo que no hay
 * textos duplicados entre el editor y la página pública.
 *
 * Si no hay contenido publicado (o falla la API) se usa este objeto tal cual:
 * la landing nunca queda vacía.
 */

export interface SimulatorProduct {
  id: number;
  name: string;
  unit: string;
  price: number;
  supplier: string;
  fefoDiscount: number;
  defaultQty?: number;
}

export interface DeliveryStatus {
  id: string;
  label: string;
  time: string;
  desc: string;
  speed: string;
  eta: string;
}

export interface LandingRole {
  key: string;
  name: string;
  summary: string;
  highlights: string[];
  mockupData: {
    title: string;
    metrics: { label: string; val: string }[];
    actionText: string;
  };
}

export interface LandingBanner {
  label: string;
  title: string;
  body: string;
  image_url: string;
  link_url: string;
}

export interface LandingNewsItem {
  title: string;
  summary: string;
  date: string;
  image_url: string;
  link_url: string;
}

/** Apariencia editable de la landing (fondo, colores y animaciones). */
export interface LandingAppearance {
  backgroundType: 'gradient' | 'solid' | 'image';
  backgroundColor: string;
  backgroundImageUrl: string;
  backgroundOverlayColor: string;
  backgroundOverlay: number;
  brandColor: string;
  brandDarkColor: string;
  brandLightColor: string;
  accentColor: string;
  textColor: string;
  mutedTextColor: string;
  auroraEnabled: boolean;
  auroraColors: string[];
  auroraOpacity: number;
  auroraSpeed: number;
  particlesEnabled: boolean;
  particleColor: string;
  particleOpacity: number;
  particleCount: number;
}

export interface LandingContent {
  appearance: LandingAppearance;
  nav: {
    features: string;
    simulator: string;
    roles: string;
    howItWorks: string;
    benefits: string;
    login: string;
    register: string;
  };
  hero: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    subtext: string;
    mapTitle: string;
    velLabel: string;
    etaLabel: string;
    mapAriaLabel: string;
    mapLabels: { warehouse: string; restaurant: string; viaduct: string };
    simulateCta: string;
    completeCta: string;
  };
  marquee: { chips: string[] };
  stats: { items: { value: string; label: string }[] };
  features: {
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  simulator: {
    title: string;
    subtitle: string;
    typeLabel: string;
    ingredientsLabel: string;
    types: { key: string; label: string }[];
    productsByType: Record<string, SimulatorProduct[]>;
    receipt: {
      title: string;
      stamp: string;
      issuer: string;
      buyer: string;
      date: string;
      subtotal: string;
      savings: string;
      taxes: string;
      total: string;
      cufeLabel: string;
      submit: string;
      success: string;
      decreaseLabel: string;
      increaseLabel: string;
    };
  };
  roles: {
    title: string;
    subtitle: string;
    ctaPrefix: string;
    actionLabel: string;
    data: LandingRole[];
  };
  steps: {
    title: string;
    subtitle: string;
    items: { number: string; title: string; description: string }[];
  };
  comparison: {
    title: string;
    subtitle: string;
    headers: { aspect: string; traditional: string; xupply: string };
    rows: { aspect: string; traditional: string; xupply: string }[];
    scrollHint: string;
  };
  testimonials: {
    title: string;
    items: { quote: string; author: string; role: string }[];
  };
  cta: {
    titleLead: string;
    titleHighlight: string;
    subtitle: string;
    register: string;
    download: string;
  };
  footer: {
    copyright: string;
    creditsBefore: string;
    authorOne: string;
    creditsBetween: string;
    authorTwo: string;
    contactLabel: string;
    contactEmail: string;
    location: string;
    links: { features: string; simulator: string; roles: string; login: string; register: string };
  };
  banners: { items: LandingBanner[] };
  news: {
    title: string;
    subtitle: string;
    items: LandingNewsItem[];
  };
  statuses: DeliveryStatus[];
  words: string[];
}

export const DEFAULT_LANDING_APPEARANCE: LandingAppearance = {
  backgroundType: 'gradient',
  backgroundColor: '#0b1120',
  backgroundImageUrl: '',
  backgroundOverlayColor: '#0b1120',
  backgroundOverlay: 72,
  brandColor: '#0284c7',
  brandDarkColor: '#0369a1',
  brandLightColor: '#38bdf8',
  accentColor: '#10b981',
  textColor: '#f8fafc',
  mutedTextColor: '#94a3b8',
  auroraEnabled: true,
  auroraColors: ['#0284c7', '#10b981', '#0369a1'],
  auroraOpacity: 18,
  auroraSpeed: 22,
  particlesEnabled: true,
  particleColor: '#38bdf8',
  particleOpacity: 50,
  particleCount: 65,
};

const productsByType: Record<string, SimulatorProduct[]> = {
  burger: [
    { id: 101, name: 'Carne de Res Angus (Corte Parrilla)', unit: 'Kg', price: 34000, supplier: 'Cárnicos del Oriente', fefoDiscount: 0.15, defaultQty: 0 },
    { id: 102, name: 'Queso Cheddar Americano Tajado', unit: 'Bloque 1Kg', price: 26000, supplier: 'Lácteos Santander', fefoDiscount: 0.10, defaultQty: 0 },
    { id: 103, name: 'Pan Brioche Artesanal', unit: 'Bolsa x30', price: 28000, supplier: 'Panadería La Gran Vía', fefoDiscount: 0.20, defaultQty: 0 },
    { id: 104, name: 'Aceite Vegetal de Cocina', unit: 'Bidón 20L', price: 92000, supplier: 'Distribuciones Bucaramanga', fefoDiscount: 0.05, defaultQty: 0 },
    { id: 105, name: 'Tocineta Ahumada Tajada', unit: 'Paquete 1Kg', price: 31000, supplier: 'Avícola & Porcinos del Oriente', fefoDiscount: 0.12, defaultQty: 0 },
  ],
  pizza: [
    { id: 201, name: 'Harina de Trigo Especial Pizza 00', unit: 'Bulto 25Kg', price: 78000, supplier: 'Molinos del Oriente', fefoDiscount: 0.15, defaultQty: 0 },
    { id: 202, name: 'Queso Mozzarella en Bloque', unit: 'Barra 2.5Kg', price: 46000, supplier: 'Lácteos Santander', fefoDiscount: 0.10, defaultQty: 0 },
    { id: 203, name: 'Pasta de Tomate / Salsa Pizzera', unit: 'Bidón 5Kg', price: 32000, supplier: 'Salsas & Conservas Andinas', fefoDiscount: 0.12, defaultQty: 0 },
    { id: 204, name: 'Orégano Entero Seco Aromático', unit: 'Bolsa 1Kg', price: 18000, supplier: 'Especias & Aromas BGA', fefoDiscount: 0.20, defaultQty: 0 },
    { id: 205, name: 'Pepperoni Madurado Tajado', unit: 'Paquete 1Kg', price: 38000, supplier: 'Embutidos del Oriente', fefoDiscount: 0.08, defaultQty: 0 },
  ],
  cafe: [
    { id: 301, name: 'Café Especial Grano Tostado', unit: 'Bolsa 2.5Kg', price: 65000, supplier: 'Café Mesa de los Santos', fefoDiscount: 0.15, defaultQty: 0 },
    { id: 302, name: 'Leche Entera Barista Especial', unit: 'Caja x12 Litros', price: 42000, supplier: 'Lácteos Santander', fefoDiscount: 0.10, defaultQty: 0 },
    { id: 303, name: 'Harina de Trigo Pastelera Fina', unit: 'Bulto 25Kg', price: 72000, supplier: 'Molinos del Oriente', fefoDiscount: 0.15, defaultQty: 0 },
    { id: 304, name: 'Mantequilla Sin Sal Pura', unit: 'Bloque 5Kg', price: 58000, supplier: 'Lácteos del Oriente', fefoDiscount: 0.10, defaultQty: 0 },
    { id: 305, name: 'Azúcar Refinada de Alta Pureza', unit: 'Bulto 25Kg', price: 62000, supplier: 'Distribuciones Bucaramanga', fefoDiscount: 0.05, defaultQty: 0 },
  ],
  grill: [
    { id: 401, name: 'Punta de Anca / Picanha Premium', unit: 'Kg', price: 42000, supplier: 'Cárnicos del Oriente', fefoDiscount: 0.15, defaultQty: 0 },
    { id: 402, name: 'Bife de Chorizo Angus', unit: 'Kg', price: 45000, supplier: 'Cárnicos del Oriente', fefoDiscount: 0.12, defaultQty: 0 },
    { id: 403, name: 'Costilla de Cerdo Especial BBQ', unit: 'Kg', price: 26000, supplier: 'Porcinos del Oriente', fefoDiscount: 0.18, defaultQty: 0 },
    { id: 404, name: 'Carbón Vegetal de Quebracho', unit: 'Bulto 15Kg', price: 28000, supplier: 'Distribuciones del Oriente', fefoDiscount: 0.05, defaultQty: 0 },
    { id: 405, name: 'Sal Marina Gruesa Parrillera', unit: 'Bolsa 5Kg', price: 14000, supplier: 'Especias & Sales BGA', fefoDiscount: 0.10, defaultQty: 0 },
  ],
};

const rolesData: LandingRole[] = [
  {
    key: 'admin',
    name: 'Administrador',
    summary: 'Gobierna todo el ecosistema con telemetría de sistema, auditoría de eventos y supervisión financiera.',
    highlights: ['Auditoría completa de transacciones', 'Gestión de roles y permisos RBAC', 'Supervisión de comercios y usuarios'],
    mockupData: {
      title: 'Panel de Control Maestro',
      metrics: [
        { label: 'Volumen Facturado', val: '$54.820.000 COP' },
        { label: 'Comercios Activos', val: '48 Establecimientos' },
        { label: 'Tasa SLA Entregas', val: '99.4%' },
      ],
      actionText: 'Inspeccionar auditoría',
    },
  },
  {
    key: 'restaurante',
    name: 'Restaurante',
    summary: 'Abastece tu cocina en 3 clics con precios mayoristas directos, control de stock y seguimiento del camión en el mapa.',
    highlights: ['Catálogo multi-proveedor centralizado', 'Reordenamiento inteligente semanal', 'Alerta de bajo stock por porción'],
    mockupData: {
      title: 'Gestor de Abastecimiento',
      metrics: [
        { label: 'Última Orden', val: 'PO-742 (24 productos)' },
        { label: 'Ahorro Lote FEFO', val: '$148.000 COP' },
        { label: 'Tiempo de Entrega', val: '18 min restantes' },
      ],
      actionText: 'Generar pedido rápido',
    },
  },
  {
    key: 'proveedor',
    name: 'Proveedor',
    summary: 'Publica inventario, recibe pedidos confirmados, asigna conductores y despacha con trazabilidad de lotes.',
    highlights: ['Priorización FEFO en bodega', 'Asignación inmediata de rutas', 'Factura DIAN automática al despachar'],
    mockupData: {
      title: 'Centro de Despacho Mayorista',
      metrics: [
        { label: 'Pedidos por Despachar', val: '9 órdenes' },
        { label: 'Lotes FEFO en Rotación', val: '42 SKU activos' },
        { label: 'Flujo de Caja Hoy', val: '$18.450.000 COP' },
      ],
      actionText: 'Asignar flota de reparto',
    },
  },
  {
    key: 'conductor',
    name: 'Conductor',
    summary: 'Consola táctil con optimización de ruta GPS, tiempos estimados de llegada (ETA) y confirmación digital de entrega.',
    highlights: ['Navegación paso a paso en Bucaramanga', 'Prueba de entrega con firma o foto', 'Notificación inmediata al restaurante'],
    mockupData: {
      title: 'Consola Móvil de Ruta',
      metrics: [
        { label: 'Destino Actual', val: 'Cra 33 con Calle 48 - Cabecera' },
        { label: 'Velocidad Promedio', val: '42 km/h' },
        { label: 'Entrega Estimada', val: '10:48 AM' },
      ],
      actionText: 'Confirmar llegada a destino',
    },
  },
  {
    key: 'cajero',
    name: 'Cajero / POS',
    summary: 'Facturación rápida de mostrador con generación de CUFE, cálculo de propina voluntaria e impresión de tirilla fiscal.',
    highlights: ['Integración directa con caja', 'Dispersión de impuestos IVA e INC', 'Arqueo de turnos automático'],
    mockupData: {
      title: 'Terminal POS Electrónico',
      metrics: [
        { label: 'Ventas del Turno', val: '$3.890.000 COP' },
        { label: 'Facturas DIAN Emitidas', val: '64 tirillas' },
        { label: 'Tiempo por Transacción', val: '12 segundos' },
      ],
      actionText: 'Emitir factura con CUFE',
    },
  },
];

const statuses: DeliveryStatus[] = [
  { id: 'recibido', label: 'Pedido recibido', time: '10:14 AM', desc: 'Restaurante confirma compra', speed: '0 km/h', eta: '28 min' },
  { id: 'confirmado', label: 'Proveedor confirma', time: '10:18 AM', desc: 'Stock FEFO validado', speed: '0 km/h (Bodega)', eta: '24 min' },
  { id: 'despacho', label: 'Despacho y lote', time: '10:25 AM', desc: 'Asignado a conductor', speed: '15 km/h', eta: '19 min' },
  { id: 'en_ruta', label: 'Conductor en ruta', time: '10:32 AM', desc: 'GPS satelital activo', speed: '44 km/h', eta: '8 min' },
  { id: 'entregado', label: 'Entregado y factura', time: '10:48 AM', desc: 'CUFE DIAN emitido', speed: '0 km/h (Destino)', eta: 'Entregado' },
];

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  appearance: DEFAULT_LANDING_APPEARANCE,
  nav: {
    features: 'Características',
    simulator: 'Simulador',
    roles: 'Roles',
    howItWorks: 'Cómo Funciona',
    benefits: 'Beneficios',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
  },
  hero: {
    title: 'Pide, rastrea y factura',
    subtitle: 'La plataforma B2B que sincroniza restaurantes y proveedores de alimentos: pedidos en segundos, control de inventario FEFO sin mermas, facturación electrónica DIAN y rastreo satelital GPS.',
    primaryCta: 'Abrir Aplicación',
    secondaryCta: 'Probar Simulador',
    subtext: 'Más de 50 restaurantes y distribuidores operando en Bucaramanga y Santander',
    mapTitle: 'Telemetría GPS en Vivo',
    velLabel: 'Vel:',
    etaLabel: 'ETA:',
    mapAriaLabel: 'Mapa interactivo con ruta de entrega en Bucaramanga',
    mapLabels: {
      warehouse: 'Bodega Central (Girón)',
      restaurant: 'Restaurante (Cabecera)',
      viaduct: 'Viaducto García Cadena',
    },
    simulateCta: 'Simular Entrega',
    completeCta: '¡Entrega Completada!',
  },
  marquee: {
    chips: [
      'GPS satelital en tiempo real',
      'Inventario inteligente FEFO',
      'Facturación electrónica DIAN',
      'Validación CUFE y QR',
      'Bucaramanga y Santander',
      'Copiloto XupAI para compras',
      'Seguridad RBAC y auditoría',
      'Punto de venta POS integrado',
      'Conexión directa Restaurante - Proveedor',
    ],
  },
  stats: {
    items: [
      { value: '5', label: 'Roles con permisos configurables' },
      { value: '99.8%', label: 'Entregas a tiempo con ruta optimizada' },
      { value: '100%', label: 'Cumplimiento normativo DIAN y CUFE' },
      { value: '0%', label: 'Mermas por vencimiento con FEFO' },
    ],
  },
  features: {
    title: 'Todo lo que tu cadena de suministros necesita',
    subtitle: 'Diseñado especialmente para el sector gastronómico y distribuidor en Colombia. Del pedido al plato, sin hojas de cálculo.',
    items: [
      { title: 'Seguimiento GPS satelital', description: 'Rastreo en vivo sobre el área metropolitana de Bucaramanga con consola móvil para repartidores y telemetría de ruta.' },
      { title: 'Facturación electrónica DIAN', description: 'Emisión automática de factura electrónica con CUFE, código QR, IVA y cálculo de Impoconsumo según normativa colombiana.' },
      { title: 'Control de inventario FEFO', description: 'First Expire, First Out: prioriza automáticamente los lotes de alimentos próximos a vencer, minimizando pérdidas y mermas a cero.' },
      { title: 'Copiloto XupAI', description: 'Asistente inteligente para análisis de food cost, pronóstico de demanda, sugerencia de compras por histórico y optimización de menú.' },
      { title: 'Control de acceso por roles', description: 'Permisos granulares para Administradores, Gerentes de restaurante, Proveedores mayoristas, Repartidores y Cajeros.' },
      { title: 'Pensado para Colombia', description: 'Soporte nativo para NIT, RUT, municipios de Santander, catálogos en pesos colombianos (COP) y despacho puerta a puerta.' },
    ],
  },
  simulator: {
    title: 'Simula un Pedido con Descuento FEFO y Facturación DIAN',
    subtitle: 'Calcula en tiempo real el ahorro por rotación FEFO y comprueba la emisión de la factura electrónica.',
    typeLabel: '1. Tipo de establecimiento:',
    ingredientsLabel: '2. Configurar insumos requeridos:',
    types: [
      { key: 'burger', label: 'Hamburguesería' },
      { key: 'pizza', label: 'Pizzería' },
      { key: 'cafe', label: 'Café y Panadería' },
      { key: 'grill', label: 'Parrilla y Carnes' },
    ],
    productsByType,
    receipt: {
      title: 'Factura Electrónica de Venta',
      stamp: 'Vigente DIAN',
      issuer: 'Emisor: Xupply Mayorista B2B (NIT 901.482.193-4)',
      buyer: 'Adquirente: Restaurante Asociado Bucaramanga',
      date: 'Fecha: Hoy • Régimen Común',
      subtotal: 'Subtotal Bruto',
      savings: 'Ahorro Inteligente FEFO',
      taxes: 'Impoconsumo (8%) / IVA',
      total: 'Total a Pagar',
      cufeLabel: 'CUFE (Código Único de Factura Electrónica):',
      submit: 'Emitir Pedido y Factura Demo',
      success: '¡Orden PO Transmitida con CUFE!',
      decreaseLabel: 'Disminuir',
      increaseLabel: 'Aumentar',
    },
  },
  roles: {
    title: 'Una experiencia dedicada para cada rol',
    subtitle: 'Consolas especializadas para cada usuario dentro de la cadena de suministro.',
    ctaPrefix: 'Probar vista de',
    actionLabel: 'Acción principal en consola:',
    data: rolesData,
  },
  steps: {
    title: 'Cómo funciona Xupply',
    subtitle: 'Cuatro etapas simples sincronizadas en una sola fuente de verdad.',
    items: [
      { number: '01', title: 'El restaurante arma su pedido', description: 'Selecciona insumos frescos con precios de distribuidor y aplica descuentos por lotes FEFO disponibles.' },
      { number: '02', title: 'El proveedor confirma y prepara', description: 'Bodega valida stock, descuenta inventario por lote de vencimiento y emite la orden de despacho.' },
      { number: '03', title: 'El repartidor viaja con GPS en vivo', description: 'Ruta satelital transmitida segundo a segundo. Ambos lados ven el recorrido exacto por la ciudad.' },
      { number: '04', title: 'Recepción y factura electrónica', description: 'El restaurante inspecciona la mercancía, valida con firma digital y recibe la factura DIAN con CUFE.' },
    ],
  },
  comparison: {
    title: 'Comparativa Operativa',
    subtitle: 'Compara la operación tradicional frente a la plataforma Xupply.',
    headers: { aspect: 'Aspecto Operativo', traditional: 'Método Tradicional', xupply: 'Con Xupply B2B' },
    rows: [
      { aspect: 'Pedidos y Compras', traditional: 'Llamadas telefónicas y chats de mensajería dispersos', xupply: 'Catálogo digital con confirmación instantánea' },
      { aspect: 'Control de Vencimiento', traditional: 'Alimentos vencen en bodega; mermas del 8% al 15%', xupply: 'Algoritmo FEFO estricto: rotación prioritaria y 0% mermas' },
      { aspect: 'Rastreo de Entregas', traditional: 'Llamadas frecuentes al conductor durante la ruta', xupply: 'GPS satelital en vivo con telemetría y ETA en tiempo real' },
      { aspect: 'Facturación e Impuestos', traditional: 'Facturas manuales en papel, errores en IVA e INC', xupply: 'Facturación electrónica DIAN con CUFE y QR al instante' },
      { aspect: 'Decisiones de Compra', traditional: 'Estimaciones sin datos históricos de rotación', xupply: 'Copiloto XupAI analiza consumos históricos y sugiere la orden' },
    ],
    scrollHint: 'Desliza horizontalmente para ver la tabla completa',
  },
  testimonials: {
    title: 'Respaldado por el sector gastronómico de Bucaramanga',
    items: [
      {
        quote: '"Antes perdíamos hasta un 12% en mermas por vencimiento. Con el inventario FEFO de Xupply y el seguimiento GPS, las compras llegan justo a tiempo y las mermas bajaron a cero."',
        author: 'Chef Andrés Montoya',
        role: 'Fundador, Hamburguesería Angus & Co (Cabecera)',
      },
      {
        quote: '"La facturación DIAN integrada nos ahorró 3 horas diarias de papeleo. Ahora los pedidos de 40 restaurantes se despachan con un solo clic."',
        author: 'Claudia Valenzuela',
        role: 'Gerente Comercial, Distribuidora Avícola Santander',
      },
    ],
  },
  cta: {
    titleLead: 'Lleva tu operación al',
    titleHighlight: 'siguiente nivel',
    subtitle: 'Comienza a operar hoy mismo. Conéctate con los mejores distribuidores y gestiona tu cocina con precisión digital.',
    register: 'Registrarse',
    download: 'Descargar APK Android',
  },
  footer: {
    copyright: 'Xupply © 2026 • Plataforma B2B para Restaurantes y Proveedores',
    creditsBefore: 'Creado por',
    authorOne: 'Juan Berroteran',
    creditsBetween: 'y',
    authorTwo: 'Fabio Chamorro',
    contactLabel: 'Contacto:',
    contactEmail: 'jdbpberroteran@gmail.com',
    location: 'Bucaramanga, Santander, Colombia • Proyecto de Innovación Tecnológica • ADSO SENA',
    links: {
      features: 'Características',
      simulator: 'Simulador',
      roles: 'Roles',
      login: 'Iniciar Sesión',
      register: 'Registro',
    },
  },
  banners: {
    items: [
      {
        label: 'Novedad',
        title: 'Inventario FEFO y trazabilidad en cada pedido',
        body: 'Publica tus lotes, prioriza los próximos a vencer y despacha con factura electrónica DIAN.',
        image_url: '',
        link_url: '/register',
      },
    ],
  },
  news: {
    title: 'Novedades de Xupply',
    subtitle: 'Actualizaciones y noticias para restaurantes y proveedores.',
    items: [
      {
        title: 'Rastreo GPS en tiempo real',
        summary: 'Sigue cada entrega desde la bodega hasta el restaurante con telemetría y ETA en vivo.',
        date: '2026-09-01',
        image_url: '',
        link_url: '',
      },
      {
        title: 'Facturación electrónica integrada',
        summary: 'Emite facturas con CUFE y QR directamente desde la orden de compra.',
        date: '2026-09-15',
        image_url: '',
        link_url: '',
      },
    ],
  },
  statuses,
  words: ['en tiempo real', 'sin mermas (FEFO)', 'con factura DIAN y CUFE', 'con GPS satelital', 'en Bucaramanga'],
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T>(defaults: T, published: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
  for (const [key, value] of Object.entries(published)) {
    if (key === '__proto__' || key === 'constructor' || value === undefined || value === null) continue;
    const current = result[key];
    result[key] = isPlainObject(value) && isPlainObject(current)
      ? deepMerge(current, value)
      : value;
  }
  return result as T;
}

/** Combina el contenido publicado con los valores por defecto. */
export function mergeLandingContent(published: unknown): LandingContent {
  if (!isPlainObject(published)) return DEFAULT_LANDING_CONTENT;
  return deepMerge(DEFAULT_LANDING_CONTENT, published);
}
