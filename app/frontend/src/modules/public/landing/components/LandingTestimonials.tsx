import type { LandingInteractions } from '../hooks';

type Props = Pick<LandingInteractions, 'content' | 'handleCardMouseMove' | 'handleCardMouseLeave'>;

export function LandingTestimonials({ content, handleCardMouseMove, handleCardMouseLeave }: Props) {
  const { testimonials } = content;
  return (
    <>
      {/* Testimonials */}
      <section>
        <div className="sec-head">
          <h2>{testimonials.title}</h2>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {(testimonials.items || []).map((item, index) => (
            <div
              key={index}
              className="glass tilt feat"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <p style={{ fontStyle: 'italic', fontSize: '0.98rem', marginBottom: '16px', color: 'var(--text)' }}>
                {item.quote}
              </p>
              <div>
                <b style={{ display: 'block', color: 'var(--text)', fontSize: '0.95rem' }}>{item.author}</b>
                <span style={{ fontSize: '0.82rem', color: 'var(--brand-light)' }}>{item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
