import { Link } from 'react-router-dom';
import type { LandingContent } from '../../../../shared/lib/landingContent';

export function LandingCta({ content }: { content: LandingContent }) {
  const { cta } = content;
  return (
    <>
      {/* CTA Section */}
      <section>
        <div className="cta-box">
          <h2>{cta.titleLead} <span className="gt">{cta.titleHighlight}</span></h2>
          <p>{cta.subtitle}</p>

          <div className="cta-buttons">
            <Link className="btn" to="/register">
              <span>{cta.register}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>

            <a className="btn ghost sm" href="/Xupply.apk" download>
              <span>{cta.download}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
