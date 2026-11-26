import { Link } from 'react-router-dom';
import type { LandingContent } from '../../../../shared/lib/landingContent';

export function LandingFooter({ content }: { content: LandingContent }) {
  const { footer } = content;
  return (
    <>
      {/* Footer */}
      <footer>
        <div className="wrap footer-content">
          <div className="footer-left">
            <p>{footer.copyright}</p>
            <p className="text-xs text-sky-400 font-medium mt-1">
              {footer.creditsBefore} <strong className="text-white font-semibold">{footer.authorOne}</strong>{' '}
              {footer.creditsBetween} <strong className="text-white font-semibold">{footer.authorTwo}</strong> • {footer.contactLabel}{' '}
              <a href={`mailto:${footer.contactEmail}`} className="underline hover:text-sky-300 transition-colors">{footer.contactEmail}</a>
            </p>
            <span>{footer.location}</span>
          </div>

          <div className="footer-right">
            <a href="#features">{footer.links.features}</a>
            <a href="#simulador">{footer.links.simulator}</a>
            <a href="#roles">{footer.links.roles}</a>
            <Link to="/login">{footer.links.login}</Link>
            <Link to="/register">{footer.links.register}</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
