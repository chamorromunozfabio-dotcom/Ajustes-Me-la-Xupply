import type { LandingInteractions } from '../hooks';

type Props = Pick<LandingInteractions, 'content' | 'handleCardMouseMove' | 'handleCardMouseLeave'>;

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const icons = [
  <svg {...iconProps} key="gps"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6a6 6 0 1 0 6 6" /><circle cx="12" cy="12" r="2" /></svg>,
  <svg {...iconProps} key="dian"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  <svg {...iconProps} key="fefo"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>,
  <svg {...iconProps} key="ai"><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" /></svg>,
  <svg {...iconProps} key="rbac"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  <svg {...iconProps} key="co"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>,
];

export function LandingFeatures({ content, handleCardMouseMove, handleCardMouseLeave }: Props) {
  const { features } = content;
  return (
    <>
      {/* Features Section */}
      <section id="features">
        <div className="sec-head">
          <h2>{features.title}</h2>
          <p className="sub">{features.subtitle}</p>
        </div>

        <div className="grid">
          {(features.items || []).map((item, index) => (
            <div
              key={index}
              className="glass tilt feat"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="feat-top">
                <div className="feat-icon-box">{icons[index % icons.length]}</div>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
