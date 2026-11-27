import { toast } from '../../../../shared/utils/feedback';
import { useEffect, useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Apple,
  ArrowDownWideNarrow,
  Beef,
  Coffee,
  Droplets,
  Fish,
  ImagePlus,
  Milk,
  Minus,
  Package,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShoppingBasket,
  SlidersHorizontal,
  Tag,
  Trash2,
  Wheat,
  type LucideIcon,
} from 'lucide-react';
import { api } from '../../../../shared/api/client';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useCart } from '../../../../shared/context/CartContext';
import { useNotifications } from '../../../../shared/context/NotificationContext';
import { Product, Category, Supplier } from '../../../../shared/types';
import Modal from '../../../../shared/ui/Modal';
import '../../Catalog.css';

interface ProductForm {
  name: string;
  category_id: string;
  supplier_id: string;
  description: string;
  unit: string;
  price_per_unit: string;
  min_order_qty: string;
  stock_available: string;
  image_url: string;
}

const emptyForm: ProductForm = {
  name: '',
  category_id: '',
  supplier_id: '',
  description: '',
  unit: 'kg',
  price_per_unit: '',
  min_order_qty: '1',
  stock_available: '0',
  image_url: '',
};

import { getProductImage, CATEGORY_FALLBACK_IMAGES } from '../../utils/productImage';

/** Iconos del catálogo: siempre SVG de lucide, nunca emoji del dato. */
const CATEGORY_ICONS: [RegExp, LucideIcon][] = [
  [/bebida|jugo|agua|gaseosa/i, Droplets],
  [/lácteo|lacteo|queso|leche|yogurt/i, Milk],
  [/fruta|verdura|hortaliza/i, Apple],
  [/grano|cereal|harina|arroz|condimento|especia/i, Wheat],
  [/carne|pollo|cerdo|parrilla/i, Beef],
  [/pescado|marisco/i, Fish],
  [/café|cafe|té/i, Coffee],
];

function categoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? Tag;
}

interface CustomizationConfig {
  typeLabel: string;
  typeOptions: string[];
  packLabel: string;
  packOptions: string[];
  notesPlaceholder: string;
}

type CatalogT = (...args: any[]) => any;

export function getProductCustomizationConfig(product: Product, t?: CatalogT): CustomizationConfig {
  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const pick = (key: string): CustomizationConfig | null => {
    if (!t) return null;
    const v = t(`customization_presets.${key}`, { returnObjects: true });
    return v && typeof v === 'object' ? v as CustomizationConfig : null;
  };
  if (cat.includes('bebida') || cat.includes('jugo') || name.includes('jugo') || name.includes('agua') || name.includes('gaseosa') || name.includes('bebida') || name.includes('cerveza') || name.includes('refresco')) {
    return pick('beverage') || { typeLabel:'Presentaci?n y temperatura:', typeOptions:['Refrigerado / Fr?o','Temperatura ambiente','Sin az?car a?adida','Pulpa natural 100%','Concentrado para diluir','Listo para servir'], packLabel:'Tipo de empaque requerido:', packOptions:['Botella individual','Gal?n institucional','Caja m?ster / Paca','Canastilla pl?stica retornable','Bolsa pouch herm?tica'], notesPlaceholder:'Ej. Servir fr?o, pulpa sin colar, empacar en pacas de 6 unidades...' };
  }
  if (cat.includes('lacteo') || cat.includes('l?cteo') || name.includes('queso') || name.includes('leche') || name.includes('mantequilla') || name.includes('yogurt') || name.includes('crema')) {
    return pick('dairy') || { typeLabel:'Presentaci?n y maduraci?n:', typeOptions:['Bloque entero','Tajado / Laminado','Rallado fino','Porcionado x 500g','Maduraci?n ?ptima','Refrigerado estricto'], packLabel:'Tipo de empaque requerido:', packOptions:['Sellado al vac?o','Bolsa herm?tica','Canastilla pl?stica','Caja t?rmica con hielo','Empaque est?ndar'], notesPlaceholder:'Ej. Separar tajadas con papel film, lote con m?s de 15 d?as de vencimiento...' };
  }
  if (cat.includes('verdura') || cat.includes('fruta') || name.includes('tomate') || name.includes('cebolla') || name.includes('papa') || name.includes('pimenton') || name.includes('limon') || name.includes('aguacate') || name.includes('platano') || name.includes('lechuga')) {
    return pick('produce') || { typeLabel:'Selecci?n y maduraci?n:', typeOptions:['Maduro (consumo inmediato)','Pint?n / Firme (rotaci?n 3-5 d?as)','Verde para conservar','Lavado y desinfectado','Pelado y picado','Selecci?n primera calidad'], packLabel:'Tipo de empaque requerido:', packOptions:['Canastilla pl?stica','Bolsas perforadas respirables','Caja de cart?n ventilada','Malla protectora','Empaque est?ndar'], notesPlaceholder:'Ej. Aguacates listos para usar en 2 d?as, tomates calibre mediano parejos...' };
  }
  if (cat.includes('grano') || cat.includes('condimento') || name.includes('arroz') || name.includes('frijol') || name.includes('lenteja') || name.includes('aceite') || name.includes('sal') || name.includes('azucar') || name.includes('harina')) {
    return pick('grains') || { typeLabel:'Presentaci?n y granulometr?a:', typeOptions:['Grano entero seleccionado','Molido fino','Bolsa sellada de 1kg','Saco 25kg institucional','Limpieza y secado ?ptimo'], packLabel:'Tipo de empaque requerido:', packOptions:['Saco de polipropileno','Bolsa pl?stica sellada','Caja m?ster','Empaque al vac?o','Empaque est?ndar'], notesPlaceholder:'Ej. Bultos limpios y secos, estibados para f?cil descargue...' };
  }
  return pick('meat') || { typeLabel:'Tipo de corte o preparaci?n:', typeOptions:['Corte grueso (2cm)','Corte fino / mariposa','Molido fino','Porcionado individual','Entero sin cortar','Deshuesado / Limpio'], packLabel:'Tipo de empaque requerido:', packOptions:['Sellado al vac?o','Bandeja con film','Caja t?rmica con hielo','Bolsas selladas de 1kg','Empaque est?ndar'], notesPlaceholder:'Ej. Porcionar en paquetes de 2kg y etiquetar con fecha de entrega...' };
}

export default function Catalog() {
  const { user } = useAuth();
  const { add } = useCart();
  const { push } = useNotifications();
  const { t, i18n } = useTranslation(['catalog', 'common']);
  const locale = i18n.language === 'en' ? 'en-US' : 'es-CO';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierFilter, setSupplierFilter] = useState<number | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | ''>('');

  // Cantidades interactivas por producto
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  // Modal de personalización de pedido
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [customCorte, setCustomCorte] = useState<string>('');
  const [customEmpaque, setCustomEmpaque] = useState<string>('Sellado al vacío');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [customQty, setCustomQty] = useState<number>(1);

  const isSupplier = user?.role === 'proveedor_admin' || user?.role === 'admin';

  const load = () => {
    const qs = new URLSearchParams();
    if (supplierFilter) qs.set('supplier_id', String(supplierFilter));
    if (categoryFilter) qs.set('category_id', String(categoryFilter));
    if (search) qs.set('search', search);
    api<Product[]>(`/products?${qs.toString()}`).then(setProducts).catch(console.error);
  };

  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch(console.error);
    api<Supplier[]>('/suppliers').then(setSuppliers).catch(console.error);
  }, []);

  useEffect(load, [supplierFilter, categoryFilter, search]);

  const filteredProducts = isSupplier
    ? products.filter(p => p.supplier_id === user?.supplier_id)
    : products;

  const displayedProducts = [...filteredProducts].sort((a, b) => {
    if (priceSort === 'asc') return a.price_per_unit - b.price_per_unit;
    if (priceSort === 'desc') return b.price_per_unit - a.price_per_unit;
    return 0;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      supplier_id: user?.supplier_id ? String(user.supplier_id) : (suppliers[0]?.id ? String(suppliers[0].id) : ''),
    });
    setModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category_id: String(p.category_id ?? ''),
      supplier_id: String(p.supplier_id ?? user?.supplier_id ?? ''),
      description: p.description ?? '',
      unit: p.unit,
      price_per_unit: String(p.price_per_unit),
      min_order_qty: String(p.min_order_qty),
      stock_available: String(p.stock_available),
      image_url: p.image_url ?? '',
    });
    setModal(true);
  };

  const openCustomization = (p: Product) => {
    const cfg = getProductCustomizationConfig(p, t);
    setCustomizingProduct(p);
    const initialQty = quantities[p.id] || Math.max(p.min_order_qty || 1, 1);
    setCustomQty(initialQty);
    setCustomCorte(cfg.typeOptions[0] || '');
    setCustomEmpaque(cfg.packOptions[0] || 'Empaque estándar');
    setCustomNotes('');
  };

  const handleAddCustomized = () => {
    if (!customizingProduct) return;
    const parts = [
      customCorte ? customCorte : '',
      customEmpaque ? `Empaque: ${customEmpaque}` : '',
      customNotes ? customNotes.trim() : ''
    ].filter(Boolean);
    const fullCustomization = parts.join(' • ');
    add(customizingProduct, customQty, fullCustomization || undefined);
    push({
      message: `¡${customizingProduct.name} personalizado agregado al carrito!`,
      at: new Date().toISOString()
    });
    setCustomizingProduct(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      supplier_id: form.supplier_id ? Number(form.supplier_id) : (user?.supplier_id || (suppliers[0]?.id ? Number(suppliers[0].id) : undefined)),
      category_id: form.category_id ? Number(form.category_id) : null,
      description: form.description,
      unit: form.unit,
      price_per_unit: Number(form.price_per_unit),
      min_order_qty: Number(form.min_order_qty),
      stock_available: Number(form.stock_available),
      image_url: form.image_url ? form.image_url.trim() : null,
    };
    try {
      await api(
        editing ? `/products/${editing.id}` : '/products',
        {
          method: editing ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );
      push({ message: editing ? t('product_updated', { defaultValue: 'Producto actualizado' }) : t('product_created', { defaultValue: 'Producto creado' }), at: new Date().toISOString() });
      setModal(false);
      load();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const removeProduct = async (id: number) => {
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      push({ message: t('product_deleted', { defaultValue: 'Producto desactivado' }), at: new Date().toISOString() });
      load();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const set = (k: keyof ProductForm) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const input = 'x-input';
  const label = 'x-label';

  return (
    <div className="cat x-page">
      <header className="cat__hero">
        <div>
          <p className="cat__eyebrow">{t('eyebrow')}</p>
          <h1 className="cat__title">{t('title')}</h1>
          <p className="cat__subtitle">
            {isSupplier
              ? t('subtitle_supplier', { defaultValue: 'Gestiona tu oferta y mantén los insumos al día para tus clientes.' })
              : t('subtitle')}
          </p>
        </div>
        <div className="cat__hero-actions">
          {isSupplier && (
            <button type="button" onClick={openCreate} className="x-btn x-btn--primary">
              <Plus aria-hidden="true" className="w-4 h-4" />
              {t('new_product')}
            </button>
          )}
          <span className="x-badge x-badge--primary">
            <Package aria-hidden="true" className="w-3 h-3" />
            {displayedProducts.length} {t('products_count', { defaultValue: 'producto(s)' })}
          </span>
        </div>
      </header>

      <div className="cat__toolbar x-card">
        <div className="cat__search">
          <Search aria-hidden="true" />
          <label className="sr-only" htmlFor="catalog-search">{t('search_aria')}</label>
          <input
            id="catalog-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className="x-input"
          />
        </div>
        <div className="cat__filter">
          <SlidersHorizontal aria-hidden="true" />
          <label className="sr-only" htmlFor="catalog-supplier">{t('supplier')}</label>
          <select id="catalog-supplier" value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value ? Number(e.target.value) : '')} className="x-select">
            <option value="">{t('all_suppliers', { defaultValue: 'Todos los proveedores' })}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="cat__filter">
          <Tag aria-hidden="true" />
          <label className="sr-only" htmlFor="catalog-category">{t('category')}</label>
          <select id="catalog-category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')} className="x-select">
            <option value="">{t('all')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="cat__filter">
          <ArrowDownWideNarrow aria-hidden="true" />
          <label className="sr-only" htmlFor="catalog-sort">{t('sort')}</label>
          <select id="catalog-sort" value={priceSort} onChange={(e) => setPriceSort(e.target.value as any)} className="x-select">
            <option value="">{t('sort_recent')}</option>
            <option value="desc">{t('sort_price_desc')}</option>
            <option value="asc">{t('sort_price_asc')}</option>
          </select>
        </div>
      </div>

      <div className="cat__grid">
        {displayedProducts.map((p) => (
          <div key={p.id} className="cat-card x-card--hover">
            {/* Product Image Banner */}
            <div className="cat-card__media">
              <img
                src={getProductImage(p)}
                alt={p.name}
                className="cat-card__img"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = CATEGORY_FALLBACK_IMAGES.Carnes;
                }}
              />
              <span className="cat-card__media-shade" aria-hidden="true" />
              <span className="cat-card__cat">{p.category || t('general', { ns: 'common', defaultValue: 'General' })}</span>
              <span className="cat-card__stock">{t('available', { ns: 'common', defaultValue: 'Disp' })}: {p.stock_available} {p.unit}</span>
            </div>

            {/* Product Card Content */}
            <div className="cat-card__body">
              <h3 className="cat-card__name">{p.name}</h3>
              <p className="cat-card__supplier">{p.supplier_name}</p>
              {p.description && <p className="cat-card__desc">{p.description}</p>}

              <div className="cat-card__pricing">
                <div>
                  <span className="cat-card__price-label">{t('wholesale_price', { defaultValue: 'Precio mayorista' })}</span>
                  <span className="cat-card__price">
                    ${p.price_per_unit.toLocaleString(locale)}{' '}
                    <small>/ {p.unit}</small>
                  </span>
                </div>
                <span className="cat-card__min">{t('min_order', { count: p.min_order_qty })} {p.unit}</span>
              </div>

              {isSupplier ? (
                <div className="cat-card__actions">
                  <button type="button" onClick={() => openEdit(p)} className="x-btn">
                    <Pencil aria-hidden="true" className="w-3.5 h-3.5" />
                    {t('edit_product')}
                  </button>
                  <button type="button" onClick={() => removeProduct(p.id)} className="x-btn x-btn--danger">
                    <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                    {t('delete_product')}
                  </button>
                </div>
              ) : user?.role === 'gerente' ? (
                <div className="cat-card__buy">
                  {/* Selector rápido de cantidad */}
                  <div className="cat-card__stepper">
                    <span>{t('quantity', { ns: 'common', defaultValue: 'Cantidad' })} ({p.unit})</span>
                    <div className="cat-card__stepper-controls">
                      <button
                        type="button"
                        aria-label={t('decrease_qty', { ns: 'common', defaultValue: 'Disminuir cantidad' })}
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [p.id]: Math.max(p.min_order_qty || 1, (prev[p.id] || p.min_order_qty || 1) - 1),
                          }))
                        }
                        className="cat-card__step-btn"
                      >
                        <Minus aria-hidden="true" />
                      </button>
                      <input
                        type="number"
                        aria-label={`${t('quantity', { ns: 'common', defaultValue: 'Cantidad' })} ${p.name}`}
                        min={p.min_order_qty || 1}
                        value={quantities[p.id] ?? (p.min_order_qty || 1)}
                        onChange={(e) =>
                          setQuantities((prev) => ({ ...prev, [p.id]: Math.max(1, Number(e.target.value)) }))
                        }
                        className="cat-card__qty"
                      />
                      <button
                        type="button"
                        aria-label={t('increase_qty', { ns: 'common', defaultValue: 'Aumentar cantidad' })}
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [p.id]: (prev[p.id] || p.min_order_qty || 1) + 1,
                          }))
                        }
                        className="cat-card__step-btn"
                      >
                        <Plus aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="cat-card__actions">
                    <button
                      type="button"
                      onClick={() => openCustomization(p)}
                      className="x-btn cat-card__custom"
                      title={t('customize')}
                    >
                      <Settings2 aria-hidden="true" className="w-3.5 h-3.5" />
                      {t('customize')}
                    </button>
                    <button
                      type="button"
                      onClick={() => add(p, quantities[p.id] || Math.max(p.min_order_qty || 1, 1))}
                      className="x-btn x-btn--primary cat-card__add"
                    >
                      <ShoppingBasket aria-hidden="true" className="w-3.5 h-3.5" />
                      {t('add')}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="cat-card__locked">{t('only_managers_buy', { ns: 'common', defaultValue: 'Solo los gerentes pueden comprar' })}</p>
              )}
            </div>
          </div>
        ))}
        {displayedProducts.length === 0 && (
          <div className="cat__empty x-empty">
            <div className="x-empty__icon"><Package aria-hidden="true" className="w-6 h-6" /></div>
            <p className="x-empty__title">{t('empty_title')}</p>
            <p className="x-empty__text">{search ? t('empty_search', { query: search }) : categoryFilter ? t('empty_filters') : t('empty_default')}</p>
          </div>
        )}
      </div>

      {/* Modal de Personalización de Pedido */}
      {customizingProduct && (
        <Modal
          title={`${t('modal_customize')}: ${customizingProduct.name}`}
          onClose={() => setCustomizingProduct(null)}
        >
          <div className="cat__modal">
            <div className="cat__summary">
              <img
                src={getProductImage(customizingProduct)}
                alt={customizingProduct.name}
                className="cat__summary-img"
              />
              <div className="min-w-0">
                <h4 className="cat__summary-name">{customizingProduct.name}</h4>
                <p className="cat__summary-supplier">{customizingProduct.supplier_name}</p>
                <p className="cat__summary-price">
                  ${customizingProduct.price_per_unit.toLocaleString(locale)} COP / {customizingProduct.unit}
                </p>
              </div>
            </div>

            {/* Cantidad a pedir */}
            <div>
              <label className="x-label" htmlFor="custom-qty">
                {t('qty_to_order', { ns: 'common', defaultValue: 'Cantidad a ordenar' })} ({customizingProduct.unit})
              </label>
              <div className="cat__modal-qty">
                <button
                  type="button"
                  aria-label={t('decrease_qty', { ns: 'common', defaultValue: 'Disminuir cantidad' })}
                  onClick={() => setCustomQty((q) => Math.max(customizingProduct.min_order_qty || 1, q - 1))}
                  className="cat__step-btn"
                >
                  <Minus aria-hidden="true" />
                </button>
                <input
                  id="custom-qty"
                  type="number"
                  min={customizingProduct.min_order_qty || 1}
                  value={customQty}
                  onChange={(e) => setCustomQty(Math.max(1, Number(e.target.value)))}
                  className="cat__modal-qty-input"
                />
                <button
                  type="button"
                  aria-label={t('increase_qty', { ns: 'common', defaultValue: 'Aumentar cantidad' })}
                  onClick={() => setCustomQty((q) => q + 1)}
                  className="cat__step-btn"
                >
                  <Plus aria-hidden="true" />
                </button>
                <span className="cat__subtotal">
                  {t('subtotal', { ns: 'common', defaultValue: 'Subtotal' })}: <b>${(customQty * customizingProduct.price_per_unit).toLocaleString(locale)} COP</b>
                </span>
              </div>
            </div>

            {/* Opciones dinámicas según tipo de producto (Bebidas, Lácteos, Carnes, Verduras, etc.) */}
            {customizingProduct && (() => {
              const cfg = getProductCustomizationConfig(customizingProduct, t);
              return (
                <>
                  <div>
                    <p className="x-label">{cfg.typeLabel}</p>
                    <div className="cat__chips">
                      {cfg.typeOptions.map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setCustomCorte(customCorte === op ? '' : op)}
                          className={`cat__chip ${customCorte === op ? 'cat__chip--active' : ''}`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="x-label">{cfg.packLabel}</p>
                    <div className="cat__chips">
                      {cfg.packOptions.map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setCustomEmpaque(op)}
                          className={`cat__chip cat__chip--pack ${customEmpaque === op ? 'cat__chip--active' : ''}`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notas especiales adicionales */}
                  <div>
                    <label className="x-label" htmlFor="custom-notes">
                      {t('additional_notes')}
                    </label>
                    <textarea
                      id="custom-notes"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder={cfg.notesPlaceholder}
                      rows={2}
                      className="x-textarea"
                    />
                  </div>
                </>
              );
            })()}

            <div className="cat__modal-actions">
              <button
                type="button"
                onClick={() => setCustomizingProduct(null)}
                className="x-btn"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleAddCustomized}
                className="x-btn x-btn--primary"
              >
                <ShoppingBasket aria-hidden="true" className="w-4 h-4" />
                {t('add_customized')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Proveedor: Crear / Editar producto */}
      {modal && (
        <Modal title={editing ? `${t('modal_edit')} ${editing.name}` : t('modal_new')} onClose={() => setModal(false)}>
          <form onSubmit={submit} className="cat__form">
            <div>
              <label className={label}>{t('name')}</label>
              <input value={form.name} onChange={set('name')} className={input} required />
            </div>
            {(user?.role === 'admin' || !user?.supplier_id) && suppliers.length > 0 && (
              <div>
                <label className={label}>{t('supplier')}</label>
                <select value={form.supplier_id} onChange={set('supplier_id')} className={input}>
                  <option value="">{t('select')}...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={label}>{t('category')}</label>
              <select value={form.category_id} onChange={set('category_id')} className={input}>
                <option value="">{t('no_category', { defaultValue: 'Sin categoría' })}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>{t('image_optional')}</label>
              <input
                type="url"
                placeholder={t('image_url_placeholder')}
                value={form.image_url}
                onChange={set('image_url')}
                className={input}
              />
            </div>
            <div>
              <label className={label}>{t('description', { ns: 'common', defaultValue: 'Descripción' })}</label>
              <textarea value={form.description} onChange={set('description')} className={input} rows={2} />
            </div>
            <div className="cat__form-grid">
              <div>
                <label className={label}>{t('price')}</label>
                <input type="number" step="0.01" min="0" value={form.price_per_unit} onChange={set('price_per_unit')} className={input} required />
              </div>
              <div>
                <label className={label}>{t('unit')}</label>
                <select value={form.unit} onChange={set('unit')} className={input}>
                  <option value="kg">kg</option>
                  <option value="libra">libra</option>
                  <option value="unidad">unidad</option>
                  <option value="litro">litro</option>
                </select>
              </div>
              <div>
                <label className={label}>{t('min_order_label')}</label>
                <input type="number" step="0.01" min="0" value={form.min_order_qty} onChange={set('min_order_qty')} className={input} />
              </div>
              <div>
                <label className={label}>{t('stock')}</label>
                <input type="number" step="0.01" min="0" value={form.stock_available} onChange={set('stock_available')} className={input} />
              </div>
            </div>
            <button type="submit" className="x-btn x-btn--primary x-btn--block cat__submit">
              {editing ? t('save_changes') : t('create_product')}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}