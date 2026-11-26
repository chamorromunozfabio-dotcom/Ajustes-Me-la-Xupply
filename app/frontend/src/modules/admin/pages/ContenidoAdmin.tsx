import '../components/ContentEditor.css';
import { useEffect, useState } from 'react';
import {
  AppWindow,
  Eye,
  Globe2,
  Megaphone,
  Monitor,
  Newspaper,
  Palette,
  Rocket,
  Settings2,
  Smartphone,
  Tag,
  Target,
  Type,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { api } from '../../../shared/api/client';
import {
  DEFAULT_LANDING_CONTENT,
  mergeLandingContent,
  type LandingContent,
} from '../../../shared/lib/landingContent';
import {
  DEFAULT_SHELL_CONTENT,
  mergeShellContent,
  SHELL_CONTENT_SLUG,
  type ShellContent,
} from '../../../shared/lib/shellContent';
import { LANDING_CONTENT_SLUG } from '../../../shared/lib/useLandingContent';
import {
  ContentField,
  humanize,
  type JsonValue,
} from '../components/ContentField';
import {
  ContentPreview,
  type PreviewSection,
} from '../components/ContentPreview';
import { ShellPreview } from '../components/ShellPreview';

interface ContentRow {
  id: number;
  slug: string;
  body: unknown;
  is_active: boolean;
}

type SurfaceId = 'landing' | 'shell';

interface EditorTab {
  id: PreviewSection;
  surface: SurfaceId;
  label: string;
  icon: LucideIcon;
  keys: string[];
}

const SURFACES: { id: SurfaceId; label: string; icon: LucideIcon }[] = [
  { id: 'landing', label: 'Landing pública', icon: Globe2 },
  { id: 'shell', label: 'Interfaz de la app', icon: AppWindow },
];

const TABS: EditorTab[] = [
  { id: 'apariencia', surface: 'landing', label: 'Apariencia', icon: Palette, keys: ['appearance'] },
  { id: 'inicio', surface: 'landing', label: 'Inicio', icon: Rocket, keys: ['nav', 'hero', 'marquee', 'stats', 'statuses', 'words'] },
  { id: 'producto', surface: 'landing', label: 'Producto', icon: Settings2, keys: ['features', 'simulator'] },
  { id: 'confianza', surface: 'landing', label: 'Confianza', icon: Users, keys: ['roles', 'steps', 'comparison', 'testimonials'] },
  { id: 'cierre', surface: 'landing', label: 'Cierre', icon: Target, keys: ['cta', 'footer'] },
  { id: 'novedades', surface: 'landing', label: 'Banners y noticias', icon: Newspaper, keys: ['banners', 'news'] },
  { id: 'shell-brand', surface: 'shell', label: 'Marca', icon: Tag, keys: ['brand'] },
  { id: 'shell-colors', surface: 'shell', label: 'Colores y fondo', icon: Palette, keys: ['appearance'] },
  { id: 'shell-labels', surface: 'shell', label: 'Etiquetas', icon: Type, keys: ['labels'] },
  { id: 'shell-visibility', surface: 'shell', label: 'Visibilidad', icon: Eye, keys: ['visibility'] },
  { id: 'shell-notice', surface: 'shell', label: 'Aviso global', icon: Megaphone, keys: ['notice'] },
];

const SLUGS: Record<SurfaceId, string> = {
  landing: LANDING_CONTENT_SLUG,
  shell: SHELL_CONTENT_SLUG,
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default function ContenidoAdmin() {
  const [surface, setSurface] = useState<SurfaceId>('landing');
  const [activeTab, setActiveTab] = useState<PreviewSection>('apariencia');
  const [previewWide, setPreviewWide] = useState(true);
  const [rows, setRows] = useState<Record<SurfaceId, ContentRow | null>>({
    landing: null,
    shell: null,
  });
  const [landingDraft, setLandingDraft] = useState<LandingContent>(() => clone(DEFAULT_LANDING_CONTENT));
  const [shellDraft, setShellDraft] = useState<ShellContent>(() => clone(DEFAULT_SHELL_CONTENT));
  const [dirty, setDirty] = useState<Record<SurfaceId, boolean>>({ landing: false, shell: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api<ContentRow[]>('/admin/content')
      .then((items) => {
        if (!alive || !Array.isArray(items)) return;
        const landing = items.find((item) => item.slug === LANDING_CONTENT_SLUG) ?? null;
        const shell = items.find((item) => item.slug === SHELL_CONTENT_SLUG) ?? null;
        setRows({ landing, shell });
        setLandingDraft(
          landing?.body && typeof landing.body === 'object'
            ? mergeLandingContent(landing.body)
            : clone(DEFAULT_LANDING_CONTENT)
        );
        setShellDraft(
          shell?.body && typeof shell.body === 'object'
            ? mergeShellContent(shell.body)
            : clone(DEFAULT_SHELL_CONTENT)
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el contenido'))
      .finally(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const switchSurface = (next: SurfaceId) => {
    setSurface(next);
    setActiveTab(TABS.find((tab) => tab.surface === next)!.id);
    setMessage('');
    setError('');
  };

  const updateLanding = (key: keyof LandingContent, value: JsonValue) => {
    setLandingDraft((prev) => ({ ...prev, [key]: value } as LandingContent));
    setDirty((prev) => ({ ...prev, landing: true }));
    setMessage('');
  };

  const updateShell = (key: keyof ShellContent, value: JsonValue) => {
    setShellDraft((prev) => ({ ...prev, [key]: value } as ShellContent));
    setDirty((prev) => ({ ...prev, shell: true }));
    setMessage('');
  };

  const save = async () => {
    const row = rows[surface];
    const payload = surface === 'landing'
      ? {
          section: 'landing',
          kind: 'object',
          title: 'Contenido de la landing',
          label: 'Landing',
          body: landingDraft,
          sort_order: 0,
          is_active: row?.is_active ?? true,
        }
      : {
          section: 'site',
          kind: 'object',
          title: 'Interfaz global',
          label: 'Interfaz',
          body: shellDraft,
          sort_order: 0,
          is_active: row?.is_active ?? true,
        };

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const saved = row
        ? await api<ContentRow>(`/admin/content/${row.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
        : await api<ContentRow>('/admin/content', {
            method: 'POST',
            body: JSON.stringify({ slug: SLUGS[surface], ...payload }),
          });

      setRows((prev) => ({ ...prev, [surface]: saved }));
      if (saved.body && typeof saved.body === 'object') {
        if (surface === 'landing') setLandingDraft(mergeLandingContent(saved.body));
        else setShellDraft(mergeShellContent(saved.body));
      }
      setDirty((prev) => ({ ...prev, [surface]: false }));
      setMessage(
        surface === 'landing'
          ? 'Contenido de la landing guardado correctamente.'
          : 'Interfaz global guardada. Los cambios ya se aplican a todas las vistas.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el contenido');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async () => {
    const row = rows[surface];
    if (!row) {
      setError('Guarda el contenido antes de publicarlo.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await api<ContentRow>(`/admin/content/${row.id}/toggle`, { method: 'PATCH' });
      setRows((prev) => ({ ...prev, [surface]: updated }));
      if (updated.body && typeof updated.body === 'object') {
        if (surface === 'landing') setLandingDraft(mergeLandingContent(updated.body));
        else setShellDraft(mergeShellContent(updated.body));
      }
      setDirty((prev) => ({ ...prev, [surface]: false }));
      setMessage(updated.is_active
        ? (surface === 'landing' ? 'Contenido publicado en la landing.' : 'Interfaz global publicada en la app.')
        : 'Contenido desactivado; se muestran los valores originales.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado');
    } finally {
      setSaving(false);
    }
  };

  const restore = () => {
    const nombre = surface === 'landing' ? 'la landing' : 'la interfaz global';
    if (!window.confirm(`¿Restaurar todos los valores originales de ${nombre} en el editor? No afecta a lo ya publicado hasta que guardes.`)) return;
    if (surface === 'landing') setLandingDraft(clone(DEFAULT_LANDING_CONTENT));
    else setShellDraft(clone(DEFAULT_SHELL_CONTENT));
    setDirty((prev) => ({ ...prev, [surface]: true }));
    setMessage('Valores originales restaurados en el editor. Recuerda guardar.');
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Cargando contenido…</div>;
  }

  const currentRow = rows[surface];
  const tabs = TABS.filter((tab) => tab.surface === surface);
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="ce">
      <header className="ce__header">
        <div>
          <p className="ce__eyebrow">Mini-CMS · Técnico</p>
          <h1>{surface === 'landing' ? 'Contenido de la landing' : 'Interfaz de la aplicación'}</h1>
          <p className="ce__lead">
            {surface === 'landing'
              ? 'Edita textos, colores, fondo, animaciones, banners y noticias sin tocar código. La vista previa se actualiza mientras escribes.'
              : 'Cambia marca, colores, fondo, etiquetas y elementos visibles del menú en todas las cuentas. Solo campos seguros: sin HTML ni scripts.'}
          </p>
        </div>
        <div className="ce__header-side">
          <span className={`ce__status${currentRow?.is_active ? ' ce__status--on' : ''}`}>
            <i />
            {currentRow ? (currentRow.is_active ? 'Publicado' : 'Desactivado') : 'Sin publicar'}
          </span>
          {dirty[surface] ? <span className="ce__status ce__status--dirty"><i />Cambios sin guardar</span> : null}
          <a href="/" target="_blank" rel="noreferrer" className="ce__link">Ver landing ↗</a>
        </div>
      </header>

      <div className="ce__surface" aria-label="Superficie a editar">
        {SURFACES.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`${surface === item.id ? 'ce__surface--active' : ''}${dirty[item.id] ? ' ce__surface--dirty' : ''}`}
              onClick={() => switchSurface(item.id)}
            >
              <Icon size={14} className="ce__surface-icon" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="ce__toolbar">
        <button type="button" className="ce__btn ce__btn--primary" disabled={saving} onClick={save}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button type="button" className="ce__btn" disabled={saving} onClick={toggle}>
          {currentRow?.is_active ? 'Desactivar publicación' : 'Publicar'}
        </button>
        <button type="button" className="ce__btn ce__btn--ghost" onClick={restore}>
          Restaurar originales
        </button>
      </div>

      {error ? <div className="ce__alert ce__alert--error">{error}</div> : null}
      {message ? <div className="ce__alert ce__alert--ok">{message}</div> : null}
      {!currentRow ? (
        <div className="ce__alert ce__alert--info">
          Todavía no hay contenido publicado en esta superficie. Se muestran los valores originales; al guardar se creará el bloque editable.
        </div>
      ) : null}
      {currentRow && !currentRow.is_active ? (
        <div className="ce__alert ce__alert--warn">
          La publicación está desactivada, así que se muestran los valores originales.
        </div>
      ) : null}

      <div className="ce__layout">
        <section className="ce__editor">
          <nav className="ce__tabs" aria-label="Secciones del contenido">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`ce__tab${activeTab === tab.id ? ' ce__tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={14} className="ce__tab-icon" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="ce__panel">
            <div className="ce__panel-head">
              <div>
                <p className="ce__eyebrow">Editando</p>
                <h2>{active.label}</h2>
              </div>
              <span>{active.keys.length} bloques</span>
            </div>
            {active.keys.map((key, index) => (
              <details key={key} className="ce__section" open={index === 0}>
                <summary>
                  <span>{humanize(key)}</span>
                  <i>▾</i>
                </summary>
                <div className="ce__section-body">
                  {surface === 'landing' ? (
                    <ContentField
                      fieldKey={key}
                      label=""
                      value={landingDraft[key as keyof LandingContent] as JsonValue}
                      onChange={(value) => updateLanding(key as keyof LandingContent, value)}
                    />
                  ) : (
                    <ContentField
                      fieldKey={key}
                      label=""
                      value={shellDraft[key as keyof ShellContent] as unknown as JsonValue}
                      onChange={(value) => updateShell(key as keyof ShellContent, value)}
                    />
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>

        <aside className="ce__preview">
          <div className="ce__preview-head">
            <div>
              <p className="ce__eyebrow">En vivo</p>
              <h2>Vista previa</h2>
            </div>
            <div className="ce__preview-controls">
              <span>{active.label}</span>
              <div className="ce__device-toggle" role="group" aria-label="Ancho de la vista previa">
                <button
                  type="button"
                  aria-label="Vista de escritorio"
                  aria-pressed={previewWide}
                  className={previewWide ? 'ce__device--active' : ''}
                  onClick={() => setPreviewWide(true)}
                >
                  <Monitor size={13} />
                </button>
                <button
                  type="button"
                  aria-label="Vista móvil"
                  aria-pressed={!previewWide}
                  className={!previewWide ? 'ce__device--active' : ''}
                  onClick={() => setPreviewWide(false)}
                >
                  <Smartphone size={13} />
                </button>
              </div>
            </div>
          </div>
          <div className={`ce__frame${previewWide ? '' : ' ce__frame--phone'}`}>
            <div className="ce__frame-bar">
              <span className="ce__dots"><i /><i /><i /></span>
              <span className="ce__frame-url">{surface === 'landing' ? 'xupply.app' : 'app.xupply'}</span>
              <span className="ce__live">EN VIVO</span>
            </div>
            <div className="ce__frame-body">
              {surface === 'landing' ? (
                <ContentPreview content={landingDraft} section={activeTab} />
              ) : (
                <ShellPreview content={shellDraft} />
              )}
            </div>
          </div>
          <p className="ce__preview-note">
            {surface === 'landing'
              ? 'La vista usa los mismos estilos que la landing. Guarda y publica para verla en `/`.'
              : 'La vista usa las mismas variables que la app. Guarda y publica para verlo en cualquier cuenta.'}
          </p>
        </aside>
      </div>
    </div>
  );
}
