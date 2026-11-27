import type { LandingContent } from '../../../../shared/lib/landingContent';

const GITHUB_JUAN = 'https://github.com/JuanBerro-back';
const GITHUB_FABIO = 'https://github.com/chamorromunozfabio-dotcom';

export function LandingFooter({ content }: { content: LandingContent }) {
  const { footer } = content;
  // El CMS puede traer el copyright con descripción añadida; mostramos solo
  // la parte corta ("Xupply © 2026") para no recargar el pie de página.
  const shortCopyright = footer.copyright.split('•')[0].trim() || footer.copyright;

  return (
    <>
      {/* Footer */}
      <footer>
        <div className="wrap footer-content">
          {/* El menú va primero, encima de los datos de contacto. */}
          <nav className="footer-right" aria-label="Enlaces del pie de página">
            <a href="#features">{footer.links.features}</a>
            <a href="#simulador">{footer.links.simulator}</a>
            <a href="#roles">{footer.links.roles}</a>
            <a href="#como">{content.nav?.howItWorks}</a>
            <a href="#comparativa">{content.nav?.benefits}</a>
          </nav>

          <div className="footer-left">
            <p className="footer-copyright">{shortCopyright}</p>

            <p className="footer-credits">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>
                {footer.creditsBefore} <strong>{footer.authorOne}</strong>{' '}
                {footer.creditsBetween} <strong>{footer.authorTwo}</strong>
              </span>
            </p>

            <div className="footer-contact" aria-label="Datos de contacto">
              <a
                className="footer-icon-link"
                href={GITHUB_JUAN}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver GitHub de Juan Berroteran"
                title="GitHub · Juan Berroteran"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.22c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z" />
                </svg>
              </a>
              <a
                className="footer-icon-link"
                href={GITHUB_FABIO}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver GitHub de Fabio Chamorro"
                title="GitHub · Fabio Chamorro"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.22c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z" />
                </svg>
              </a>
              <a
                className="footer-icon-link"
                href={`mailto:${footer.contactEmail}`}
                aria-label={`Enviar correo a ${footer.contactEmail}`}
                title={footer.contactEmail}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
