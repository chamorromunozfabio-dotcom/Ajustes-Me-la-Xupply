import { Link } from 'react-router-dom';
import type { KeyboardEvent } from 'react';
import type { LandingInteractions } from '../hooks';

type Props = Pick<LandingInteractions, 'content' | 'activeRole' | 'setActiveRole'>;

export function LandingRoles({ content, activeRole, setActiveRole }: Props) {
  const { roles } = content;
  const data = Array.isArray(roles.data) ? roles.data : [];

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (!data.length) return;
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? data.length - 1
        : event.key === 'ArrowRight'
          ? (index + 1) % data.length
          : (index - 1 + data.length) % data.length;
    const nextRole = data[nextIndex];
    if (!nextRole) return;
    setActiveRole(nextRole.key);
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[nextIndex]?.focus();
  };

  return (
    <>
      {/* Roles Section */}
      <section id="roles">
        <div className="sec-head">
          <h2>{roles.title}</h2>
          <p className="sub">{roles.subtitle}</p>
        </div>

        {/* Role Tabs */}
        <div className="role-tabs" role="tablist" aria-label={roles.title}>
          {data.map((role, index) => (
            <button
              key={role.key}
              type="button"
              role="tab"
              id={`role-tab-${role.key}`}
              aria-selected={activeRole === role.key}
              aria-controls={`role-panel-${role.key}`}
              tabIndex={activeRole === role.key ? 0 : -1}
              className={'role-tab-btn' + (activeRole === role.key ? ' active' : '')}
              onClick={() => setActiveRole(role.key)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span>{role.name}</span>
            </button>
          ))}
        </div>

        {/* Role Panels */}
        <div className="glass roles-glass">
          {data.map(role => (
            <div
              key={role.key}
              role="tabpanel"
              id={`role-panel-${role.key}`}
              aria-labelledby={`role-tab-${role.key}`}
              hidden={activeRole !== role.key}
              className={'role-panel' + (activeRole === role.key ? ' active' : '')}
            >
              <div className="role-info">
                <h3>{role.name}</h3>
                <p>{role.summary}</p>
                <ul className="role-highlights">
                  {(role.highlights || []).map((item, idx) => (
                    <li key={idx}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link className="btn sm" to="/register">
                  <span>{roles.ctaPrefix} {role.name}</span>
                </Link>
              </div>

              <div className="mockup-preview">
                <div className="mockup-header">
                  <div className="mockup-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="mockup-title">{role.mockupData?.title}</div>
                </div>

                <div className="mockup-metrics">
                  {(role.mockupData?.metrics || []).map((m, idx) => (
                    <div key={idx} className="m-metric">
                      <span>{m.label}</span>
                      <b>{m.val}</b>
                    </div>
                  ))}
                </div>

                <div className="mockup-action-box">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                    {roles.actionLabel}
                  </span>
                  <span
                    className="btn sm ghost mockup-action"
                    title="Vista previa: acción no ejecutable"
                  >
                    {role.mockupData?.actionText}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
