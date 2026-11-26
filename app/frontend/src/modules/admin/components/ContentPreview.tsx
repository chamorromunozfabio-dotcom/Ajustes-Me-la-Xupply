import { getLandingAppearanceStyle, isExternalHttpUrl } from '../../../shared/lib/landingAppearance';
import type { LandingContent } from '../../../shared/lib/landingContent';

export type PreviewSection =
  | 'apariencia'
  | 'inicio'
  | 'producto'
  | 'confianza'
  | 'cierre'
  | 'novedades'
  | 'shell-brand'
  | 'shell-colors'
  | 'shell-labels'
  | 'shell-visibility'
  | 'shell-notice';

interface Props {
  content: LandingContent;
  section: PreviewSection;
}

function PreviewImage({ url, alt }: { url: string; alt: string }) {
  if (!isExternalHttpUrl(url)) return null;
  return (
    <img
      className="cp__image"
      src={url}
      alt={alt}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
}

export function ContentPreview({ content, section }: Props) {
  const appearance = content.appearance;
  const hero = content.hero;

  const renderSection = () => {
    switch (section) {
      case 'apariencia':
        return (
          <div className="cp__block">
            <p className="cp__eyebrow">Paleta actual</p>
            <div className="cp__swatches">
              {[
                appearance.backgroundColor,
                appearance.brandColor,
                appearance.brandLightColor,
                appearance.accentColor,
                appearance.textColor,
              ].map((color, index) => (
                <span key={index} style={{ background: color }} title={color} />
              ))}
            </div>
            <p className="cp__mini">
              Fondo: {appearance.backgroundType} · Aurora: {appearance.auroraEnabled ? 'activa' : 'off'} ·
              Partículas: {appearance.particlesEnabled ? `${appearance.particleCount}` : 'off'}
            </p>
          </div>
        );
      case 'inicio':
        return (
          <>
            <div className="cp__block">
              <p className="cp__eyebrow">{content.nav.features} / {content.nav.benefits}</p>
              <div className="cp__chips">
                {content.marquee.chips.slice(0, 4).map((chip, i) => <span key={i}>{chip}</span>)}
              </div>
            </div>
            <div className="cp__stats">
              {content.stats.items.slice(0, 4).map((stat, i) => (
                <div key={i}><b>{stat.value}</b><span>{stat.label}</span></div>
              ))}
            </div>
            <div className="cp__block">
              <p className="cp__eyebrow">Frases animadas</p>
              <p className="cp__mini">{content.words.join(' · ')}</p>
            </div>
            <div className="cp__chips">
              {content.statuses.map((status) => <span key={status.id}>{status.label}</span>)}
            </div>
          </>
        );
      case 'producto':
        return (
          <>
            <div className="cp__block">
              <p className="cp__eyebrow">{content.features.title}</p>
              <p className="cp__mini">{content.features.subtitle}</p>
              <div className="cp__cards">
                {content.features.items.slice(0, 3).map((item, i) => (
                  <div key={i}><b>{item.title}</b><span>{item.description}</span></div>
                ))}
              </div>
            </div>
            <div className="cp__block">
              <p className="cp__eyebrow">{content.simulator.title}</p>
              <p className="cp__mini">{content.simulator.typeLabel} {content.simulator.types.map((t) => t.label).join(' · ')}</p>
              <p className="cp__mini">{content.simulator.receipt.title} · {content.simulator.receipt.total}: $0</p>
            </div>
          </>
        );
      case 'confianza':
        return (
          <>
            <div className="cp__block">
              <p className="cp__eyebrow">{content.roles.title}</p>
              <div className="cp__chips">
                {content.roles.data.map((role) => <span key={role.key}>{role.name}</span>)}
              </div>
              <p className="cp__mini">{content.roles.ctaPrefix} {content.roles.data[0]?.name ?? ''}</p>
            </div>
            <div className="cp__cards">
              {content.steps.items.slice(0, 3).map((step, i) => (
                <div key={i}><b>{step.number} · {step.title}</b><span>{step.description}</span></div>
              ))}
            </div>
            <div className="cp__block">
              <p className="cp__eyebrow">{content.comparison.title}</p>
              <div className="cp__table">
                <span>{content.comparison.headers.xupply}</span>
                {content.comparison.rows.slice(0, 2).map((row, i) => <span key={i}>{row.xupply}</span>)}
              </div>
            </div>
            <blockquote className="cp__quote">{content.testimonials.items[0]?.quote}</blockquote>
          </>
        );
      case 'cierre':
        return (
          <>
            <div className="cp__cta">
              <b>{content.cta.titleLead} <em>{content.cta.titleHighlight}</em></b>
              <span>{content.cta.subtitle}</span>
              <div className="cp__actions"><i>{content.cta.register}</i><i>{content.cta.download}</i></div>
            </div>
            <div className="cp__block">
              <p className="cp__eyebrow">{content.footer.copyright}</p>
              <p className="cp__mini">{content.footer.location}</p>
              <p className="cp__mini">{content.footer.contactLabel} {content.footer.contactEmail}</p>
            </div>
          </>
        );
      case 'novedades':
        return (
          <>
            <div className="cp__block">
              <p className="cp__eyebrow">{content.news.title}</p>
              <p className="cp__mini">{content.news.subtitle}</p>
            </div>
            <div className="cp__cards">
              {content.banners.items.map((item, i) => (
                <div key={`b-${i}`}>
                  <PreviewImage url={item.image_url} alt={item.title} />
                  <b>{item.label ? `${item.label} · ` : ''}{item.title}</b>
                  <span>{item.body}</span>
                </div>
              ))}
              {content.news.items.map((item, i) => (
                <div key={`n-${i}`}>
                  <PreviewImage url={item.image_url} alt={item.title} />
                  <b>{item.date ? `${item.date} · ` : ''}{item.title}</b>
                  <span>{item.summary}</span>
                </div>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="cp" style={getLandingAppearanceStyle(content)}>
      <div className={`cp__aur${appearance.auroraEnabled === false ? ' cp__aur--off' : ''}`} aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="cp__nav">
        <b><span>X</span>upply</b>
        <span>{content.nav.features}</span>
        <span>{content.nav.simulator}</span>
        <small>{content.nav.login}</small>
      </div>
      <div className="cp__hero">
        <b>{hero.title}</b>
        <span className="cp__typed">{content.words[0] ?? ''}<i /></span>
        <p>{hero.subtitle}</p>
        <div className="cp__actions"><i>{hero.primaryCta}</i><i>{hero.secondaryCta}</i></div>
      </div>
      <div className="cp__content">{renderSection()}</div>
    </div>
  );
}
