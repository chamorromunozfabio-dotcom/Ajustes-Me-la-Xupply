import './Landing.css';
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

  return (
    <div className={`landing-page landing-page--${backgroundType}`} style={getLandingAppearanceStyle(content)}>
      {/* Top Scroll Progress Line */}
      <div id="pg" ref={landing.progressRef} />

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

      {/* Main Content */}
      <main className="wrap">
        <LandingStats {...landing} />
        <LandingFeatures {...landing} />
        <LandingSimulator {...landing} />
        <LandingRoles {...landing} />
        <LandingSteps {...landing} />
        <LandingComparison content={content} />
        <LandingTestimonials {...landing} />
        <LandingUpdates content={content} />
        <LandingCta content={content} />
      </main>

      <LandingFooter content={content} />
    </div>
  );
}
