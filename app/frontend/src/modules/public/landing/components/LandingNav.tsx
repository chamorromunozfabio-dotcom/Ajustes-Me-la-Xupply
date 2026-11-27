import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../../../shared/ui/Logo';
import type { LandingContent } from '../../../../shared/lib/landingContent';

export function LandingNav({ content }: { content: LandingContent }) {
  const { nav } = content;
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Top Navigation */}
      <nav className={menuOpen ? 'nav--open' : undefined}>
        <div className="wrap">
          <div className="nav-brand">
            <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
              <Logo size={36} showWordmark={true} />
            </Link>
          </div>

          <div id="landing-nav-links" className="nav-links">
            <a href="#features" onClick={closeMenu}>{nav.features}</a>
            <a href="#simulador" onClick={closeMenu}>{nav.simulator}</a>
            <a href="#roles" onClick={closeMenu}>{nav.roles}</a>
            <a href="#como" onClick={closeMenu}>{nav.howItWorks}</a>
            <a
              href="#comparativa"
              onClick={closeMenu}
              aria-label={`${nav.benefits}: ${content.comparison?.title ?? 'Comparativa'}`}
              title={content.comparison?.title ?? undefined}
            >
              {nav.benefits}
            </a>
          </div>

          <div className="nav-actions">
            <Link className="btn ghost sm" to="/login">
              {nav.login}
            </Link>
            <Link className="btn sm" to="/register">
              {nav.register}
            </Link>
          </div>

          <button
            type="button"
            className="nav-toggle"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="landing-nav-links"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </>
  );
}
