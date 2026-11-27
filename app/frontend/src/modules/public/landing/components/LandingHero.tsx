import { Link } from 'react-router-dom';
import type { LandingInteractions } from '../hooks';

type Props = Pick<LandingInteractions, 'content' | 'typewriterText' | 'currentStep' | 'autoStep' | 'simulatedDeliverySuccess' | 'handleManualStep' | 'handleToggleAuto' | 'handleSimulateFastForward' | 'handleCardMouseMove' | 'handleCardMouseLeave'>;

export function LandingHero({ content, typewriterText, currentStep, autoStep, simulatedDeliverySuccess, handleManualStep, handleToggleAuto, handleSimulateFastForward, handleCardMouseMove, handleCardMouseLeave }: Props) {
  const { hero, statuses } = content;
  const appearance = content.appearance;
  const status = statuses[currentStep] ?? statuses[0];
  const labels = hero.mapLabels ?? { warehouse: '', restaurant: '', viaduct: '' };

  const reduceMotion = typeof window !== 'undefined'
    && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const motionEnabled = !reduceMotion;
  const atDestination = simulatedDeliverySuccess
    || (statuses.length > 0 && currentStep === statuses.length - 1);
  const markerTransform = atDestination
    ? 'translate(370 50)'
    : (motionEnabled ? undefined : 'translate(50 210)');

  return (
    <>
      {/* Hero Section */}
      <header className="wrap hero">
        <div>
          <h1>
            {hero.title}
            <br />
            <span className="gt">{typewriterText}</span>
            <span className="caret" />
          </h1>

          <p>{hero.subtitle}</p>

          <div className="hero-actions">
            <Link className="btn" to="/register">
              <span>{hero.primaryCta}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>

            <a className="btn ghost" href="#simulador">
              <span>{hero.secondaryCta}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </a>
          </div>

          <p className="hero-subtext">{hero.subtext}</p>
        </div>

        {/* Hero Visual: Live Telemetry HUD */}
        <div className="vis">
          <div className="glass tilt map-card" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
            <div className="map-header">
              <div className="map-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{hero.mapTitle}</span>
              </div>
              <div className="telemetry-row">
                <span>
                  {hero.velLabel} <b>{status?.speed}</b>
                </span>
                <span>
                  {hero.etaLabel} <b>{status?.eta}</b>
                </span>
                {status?.time ? (
                  <span>
                    Hora <b>{status.time}</b>
                  </span>
                ) : null}
              </div>
            </div>

            {/* SVG Simulated Delivery Map */}
            <div className="map-wrap">
              <svg className="map-svg" viewBox="0 0 420 260" role="img" aria-label={hero.mapAriaLabel}>
                <defs>
                  <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={appearance?.brandDarkColor ?? '#0369a1'} />
                    <stop offset="60%" stopColor={appearance?.brandLightColor ?? '#38bdf8'} />
                    <stop offset="100%" stopColor={appearance?.accentColor ?? '#10b981'} />
                  </linearGradient>
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                  </filter>
                </defs>

                {/* Grid map roads */}
                <g stroke="var(--line)" strokeWidth="1.2">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <line key={`v-${i}`} x1={i * 55} y1="0" x2={i * 55} y2="260" strokeDasharray="3 3" />
                  ))}
                  {[1, 2, 3, 4, 5].map(i => (
                    <line key={`h-${i}`} x1="0" y1={i * 50} x2="420" y2={i * 50} strokeDasharray="3 3" />
                  ))}
                </g>

                {/* Secondary roads */}
                <path d="M 20 60 Q 140 80 200 130 T 400 190" fill="none" stroke="var(--line)" strokeWidth="2" />
                <path d="M 60 240 Q 180 200 240 140 T 360 40" fill="none" stroke="var(--line)" strokeWidth="2" />

                {/* Landmarks labels */}
                <text x="35" y="235" fill="var(--text-dim)" fontSize="10" fontFamily="monospace">{labels.warehouse}</text>
                <text x="260" y="32" fill="var(--text-dim)" fontSize="10" fontFamily="monospace">{labels.restaurant}</text>
                <text x="180" y="115" fill="var(--brand-light)" fontSize="9" opacity="0.6" fontFamily="monospace">{labels.viaduct}</text>

                {/* Delivery Path Glow & Main */}
                <path
                  id="deliveryPath"
                  d="M 50 210 L 80 155 L 160 155 L 195 100 L 290 100 L 320 50 L 370 50"
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="8"
                  opacity="0.3"
                  filter="url(#routeGlow)"
                />
                <path
                  d="M 50 210 L 80 155 L 160 155 L 195 100 L 290 100 L 320 50 L 370 50"
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                >
                  {motionEnabled && !atDestination ? (
                    <animate attributeName="stroke-dashoffset" from="28" to="0" dur="0.8s" repeatCount="indefinite" />
                  ) : null}
                </path>

                {/* Origin beacon */}
                <circle cx="50" cy="210" r="8" fill="var(--brand)" />
                <circle cx="50" cy="210" r="3" fill="var(--on-brand, #ffffff)" />

                {/* Destination beacon in Emerald */}
                <circle cx="370" cy="50" r="8" fill="var(--emerald)">
                  {motionEnabled && !atDestination ? (
                    <>
                      <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                    </>
                  ) : null}
                </circle>
                <circle cx="370" cy="50" r="4" fill="var(--on-brand, #ffffff)" />

                {/* Moving vehicle marker: se detiene al entregar y respeta reduced-motion. */}
                <g transform={markerTransform}>
                  {motionEnabled && !atDestination ? (
                    <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
                      <mpath href="#deliveryPath" />
                    </animateMotion>
                  ) : null}
                  <circle cx="0" cy="0" r="10" fill="var(--brand)" stroke="var(--brand-light)" strokeWidth="2" />
                  <path d="M-3 -4 L4 0 L-3 4 Z" fill="var(--on-brand, #ffffff)" />
                </g>
              </svg>
            </div>

            {/* Interactive Status Stepper */}
            <div className="map-footer">
              <div className="sts" id="stepper">
                {statuses.map((item, index) => (
                  <button
                    key={item.id}
                    className={'st' + (index === currentStep ? ' on' : '')}
                    onClick={() => handleManualStep(index)}
                    title={item.desc}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="bar">
                <i style={{ width: `${statuses.length ? ((currentStep + 1) / statuses.length) * 100 : 0}%` }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {status?.desc}
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleToggleAuto}
                    className="btn ghost sm"
                    style={{ fontSize: '0.76rem', padding: '3px 10px' }}
                    aria-pressed={!autoStep}
                    aria-label={autoStep ? 'Pausar animación automática' : 'Reanudar animación automática'}
                    title="Controla el avance automático del estado de la entrega"
                  >
                    {autoStep ? '⏸ Pausar' : '▶ Reanudar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateFastForward}
                    className="btn ghost sm"
                    style={{ fontSize: '0.76rem', padding: '3px 10px' }}
                  >
                    {simulatedDeliverySuccess ? hero.completeCta : hero.simulateCta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
