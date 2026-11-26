import type { LandingContent } from '../../../../shared/lib/landingContent';

export function LandingComparison({ content }: { content: LandingContent }) {
  const { comparison } = content;
  return (
    <>
      {/* Comparison Section */}
      <section id="comparativa">
        <div className="sec-head">
          <h2>{comparison.title}</h2>
          <p className="sub">{comparison.subtitle}</p>
        </div>

        <div className="compare-table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>{comparison.headers?.aspect}</th>
                <th style={{ width: '35%' }}>{comparison.headers?.traditional}</th>
                <th style={{ width: '35%' }}>{comparison.headers?.xupply}</th>
              </tr>
            </thead>
            <tbody>
              {(comparison.rows || []).map((row, index) => (
                <tr key={index}>
                  <td><b>{row.aspect}</b></td>
                  <td className="compare-bad">{row.traditional}</td>
                  <td className="compare-good">{row.xupply}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-scroll-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          <span>{comparison.scrollHint}</span>
        </div>
      </section>
    </>
  );
}
