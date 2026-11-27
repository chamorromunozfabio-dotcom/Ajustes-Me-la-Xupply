import './Landing.css';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useLandingInteractions } from '../hooks';
import { getLandingAppearanceStyle } from '../../../../shared/lib/landingAppearance';
import { useLandingContent } from '../../../../shared/lib/useLandingContent';
import { LandingNav } from '../components/LandingNav';
import { LandingHero } from '../components/LandingHero';
import { LandingMarquee } from '../components/LandingMarquee';
import { LandingStats } from '../components/LandingStats';
import { LandingFeatures } from '../components/LandingFeatures';
import { LandingSimulator } from '../components/LandingSimulator';
import { LandingRoles } from '../components/LandingRoles';
import { LandingSteps } from '../components/LandingSteps';
import { LandingComparison } from '../components/LandingComparison';
import { LandingTestimonials } from '../components/LandingTestimonials';
import { LandingCta } from '../components/LandingCta';
import { LandingFooter } from '../components/LandingFooter';
import { LandingUpdates } from '../components/LandingUpdates';

export default function Landing() {
  const content = useLandingContent();
  const landing = useLandingInteractions(content);
  const appearance = content.appearance;
  const backgroundType = appearance?.backgroundType ?? 'gradient';
  const appearanceStyle = getLandingAppearanceStyle(content);
  const appearanceVars = appearanceStyle as unknown as Record<string, string | number>;
  const progressStyle = {
    '--brand': appearanceVars['--brand'],
    '--brand-light': appearanceVars['--brand-light'],
    '--emerald': appearanceVars['--emerald'],
  } as CSSProperties;

  // Fuera de .landing-page: así ningún overflow del contenedor puede recortarla.
  const progressBar = (
    <div id="pg" aria-hidden="true" style={progressStyle}>
      <i ref={landing.progressRef} />
    </div>
  );

  return (
    <>
      {typeof document !== 'undefined' ? createPortal(progressBar, document.body) : progressBar}

      <div className={`landing-page landing-page--${backgroundType}`} style={appearanceStyle}>
        {/* Ambient Subtle Blurs */}
        <div className={`aur${appearance?.auroraEnabled === false ? ' aur--off' : ''}`} aria-hidden="true">
          <i />
          <i />
          <i />
        </div>

        {/* Interactive Canvas Particle Network */}
        <canvas
          id="fx"
          className={appearance?.particlesEnabled === false ? 'fx--off' : ''}
          ref={landing.canvasRef}
          aria-hidden="true"
        />

        <LandingNav content={content} />
        <LandingHero {...landing} />
        <LandingMarquee content={content} />

        {/* Main Content (div para no anidar <main> dentro del <main> del shell) */}
        <div className="wrap">
          <LandingStats {...landing} />
          <LandingFeatures {...landing} />
          <LandingSimulator {...landing} />
          <LandingRoles {...landing} />
          <LandingSteps {...landing} />
          <LandingComparison content={content} />
          <LandingTestimonials {...landing} />
          <LandingUpdates content={content} />
          <LandingCta content={content} />
        </div>

        <LandingFooter content={content} />
      </div>
    </>
  );
}
