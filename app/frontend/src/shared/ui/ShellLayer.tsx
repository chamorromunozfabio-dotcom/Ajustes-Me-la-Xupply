import { useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import '../styles/shell.css';
import { useShellContent } from '../context/ShellContext';
import { getShellAppearanceVars } from '../lib/shellAppearance';
import { isSafeLink } from '../lib/safeValues';

/**
 * Aplica la apariencia global al documento y muestra el aviso opcional.
 * No renderiza HTML del CMS: todo pasa por React y por colores validados.
 */
export default function ShellLayer() {
  const shell = useShellContent();

  useEffect(() => {
    const root = document.documentElement;
    const vars = getShellAppearanceVars(shell.appearance);
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
    return () => {
      Object.keys(vars).forEach((key) => root.style.removeProperty(key));
    };
  }, [shell.appearance]);

  const notice = shell.notice;
  const showNotice = notice.enabled && Boolean(notice.text.trim());

  return (
    <>
      {showNotice ? (
        <div className="x-shell-notice" role="status">
          <span className="x-shell-notice__icon"><Megaphone size={13} /></span>
          <span className="x-shell-notice__text">{notice.text}</span>
          {isSafeLink(notice.linkUrl) && notice.linkLabel.trim() ? (
            <a className="x-shell-notice__link" href={notice.linkUrl} target="_blank" rel="noreferrer">
              {notice.linkLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
