import { Link } from 'react-router-dom';
import type { LandingBanner, LandingContent, LandingNewsItem } from '../../../../shared/lib/landingContent';

function ContentLink({ href, children, className }: { href?: string; children: React.ReactNode; className?: string }) {
  if (!href) return <span className={className}>{children}</span>;
  if (href.startsWith('/')) return <Link className={className} to={href}>{children}</Link>;
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
}

function BannerCard({ item }: { item: LandingBanner }) {
  return (
    <ContentLink href={item.link_url} className="glass feat landing-banner">
      {item.image_url ? (
        <img src={item.image_url} alt={item.title} style={{ width: '100%', borderRadius: '10px', marginBottom: '12px' }} />
      ) : null}
      {item.label ? <span className="hero-subtext">{item.label}</span> : null}
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </ContentLink>
  );
}

function NewsCard({ item }: { item: LandingNewsItem }) {
  return (
    <ContentLink href={item.link_url} className="glass feat landing-news">
      {item.image_url ? (
        <img src={item.image_url} alt={item.title} style={{ width: '100%', borderRadius: '10px', marginBottom: '12px' }} />
      ) : null}
      {item.date ? <span className="hero-subtext">{item.date}</span> : null}
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
    </ContentLink>
  );
}

/** Bloques de banners y noticias gestionados por el rol Técnico. */
export function LandingUpdates({ content }: { content: LandingContent }) {
  const banners = content.banners?.items || [];
  const news = content.news?.items || [];

  return (
    <>
      {banners.length ? (
        <section id="novedades">
          <div className="sec-head">
            <h2>{content.news.title}</h2>
            <p className="sub">{content.news.subtitle}</p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {banners.map((item, index) => <BannerCard key={index} item={item} />)}
          </div>
        </section>
      ) : null}

      {news.length ? (
        <section id="noticias">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {news.map((item, index) => <NewsCard key={index} item={item} />)}
          </div>
        </section>
      ) : null}
    </>
  );
}
