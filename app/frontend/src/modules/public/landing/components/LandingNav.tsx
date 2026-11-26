import { Link } from 'react-router-dom';
import Logo from '../../../../shared/ui/Logo';
import type { LandingContent } from '../../../../shared/lib/landingContent';

export function LandingNav({ content }: { content: LandingContent }) {
  const { nav } = content;
  return (
    <>
      {/* Top Navigation */}
      <nav>
        <div className="wrap">
          <div className="nav-brand">
            <Link to="/" className="flex items-center gap-2 group">
              <Logo size={36} showWordmark={true} />
            </Link>
          </div>

          <div className="nav-links">
            <a href="#features">{nav.features}</a>
            <a href="#simulador">{nav.simulator}</a>
            <a href="#roles">{nav.roles}</a>
            <a href="#como">{nav.howItWorks}</a>
            <a href="#comparativa">{nav.benefits}</a>
          </div>

          <div className="nav-actions">
            <Link className="btn ghost sm" to="/login">
              {nav.login}
            </Link>
            <Link className="btn sm" to="/register">
              {nav.register}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
