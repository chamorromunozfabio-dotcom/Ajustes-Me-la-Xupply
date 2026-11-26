import type { LandingContent } from '../../../../shared/lib/landingContent';

export function LandingMarquee({ content }: { content: LandingContent }) {
  const chips = content.marquee.chips || [];
  return (
    <>
      {/* Infinite Marquee Ticker */}
      <div className="mq" aria-hidden="true">
        <div>
          {[...chips, ...chips].map((chip, i) => (
            <span key={i}>
              <b>•</b> {chip}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
