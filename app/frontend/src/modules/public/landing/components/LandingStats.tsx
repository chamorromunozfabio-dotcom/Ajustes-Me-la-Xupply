import type { LandingInteractions } from '../hooks';

type Props = Pick<LandingInteractions, 'content' | 'handleCardMouseMove' | 'handleCardMouseLeave'>;

export function LandingStats({ content, handleCardMouseMove, handleCardMouseLeave }: Props) {
  return (
    <>
      {/* KPI Stats Section */}
      <section>
        <div className="stats">
          {(content.stats?.items || []).map((item, index) => (
            <div
              key={index}
              className="glass tilt stat-card"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <b className="gt">{item.value}</b>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
