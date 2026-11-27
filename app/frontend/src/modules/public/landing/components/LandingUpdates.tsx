import { Link } from 'react-router-dom';
import type { LandingBanner, LandingContent, LandingNewsItem } from '../../../../shared/lib/landingContent';
import { isExternalHttpUrl, safeLinkValue } from '../../../../shared/lib/safeValues';

function ContentLink({ href, children, className }: { href?: string; children: React.ReactNode; className?: string }) {
  const safeHref = safeLinkValue(href);
  if (!safeHref) return <span className={className}>{children}</span>;
  if (safeHref.startsWith('/')) return <Link className={className} to={safeHref}>{children}</Link>;
  return (
    <a className={className} href={safeHref} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function SafeImage({ url, alt }: { url?: string; alt: string }) {
  const src = isExternalHttpUrl(url) ? (url as string).trim() : '';
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={{ width: '100%', borderRadius: '10px', marginBottom: '12px' }}
      onError={(event) => { event.currentTarget.style.display = 'none'; }}
    />
  );
}

function BannerCard({ item }: { item: LandingBanner }) {
  return (
    <ContentLink href={item.link_url} className="glass feat landing-banner">
      <SafeImage url={item.image_url} alt={item.title} />
      {item.label ? <span className="hero-subtext">{item.label}</span> : null}
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </ContentLink>
  );
}

function NewsCard({ item }: { item: LandingNewsItem }) {
  return (
    <ContentLink href={item.link_url} className="glass feat landing-news">
      <SafeImage url={item.image_url} alt={item.title} />
      {item.date ? <span className="hero-subtext">{item.date}</span> : null}
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
    </ContentLink>
  );
}

/** Bloques de banners y noticias gestionados por el rol Técnico. */
export function LandingUpdates({ content }: { content: LandingContent }) {
  const banners = Array.isArray(content.banners?.items) ? content.banners.items : [];
  const news = Array.isArray(content.news?.items) ? content.news.items : [];
  const sectionHeading = (
    <div className="sec-head">
      <h2>{content.news?.title}</h2>
      <p className="sub">{content.news?.subtitle}</p>
    </div>
  );

  return (
    <>
      {banners.length ? (
        <section id="novedades">
          {sectionHeading}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {banners.map((item, index) => <BannerCard key={index} item={item} />)}
          </div>
        </section>
      ) : null}

      {news.length ? (
        <section id="noticias" aria-label={content.news?.title || 'Noticias'}>
          {banners.length ? null : sectionHeading}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {news.map((item, index) => <NewsCard key={index} item={item} />)}
          </div>
        </section>
      ) : null}
    </>
  );
}
