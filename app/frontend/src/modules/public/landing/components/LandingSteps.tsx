import type { LandingInteractions } from '../hooks';

type Props = Pick<LandingInteractions, 'content' | 'handleCardMouseMove' | 'handleCardMouseLeave'>;

export function LandingSteps({ content, handleCardMouseMove, handleCardMouseLeave }: Props) {
  const { steps } = content;
  return (
    <>
      {/* Steps Flow (Cómo Funciona) */}
      <section id="como">
        <div className="sec-head">
          <h2>{steps.title}</h2>
          <p className="sub">{steps.subtitle}</p>
        </div>

        <div className="steps-grid">
          {(steps.items || []).map((item, index) => (
            <div
              key={index}
              className="glass tilt step-card"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="step-num">{item.number}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
