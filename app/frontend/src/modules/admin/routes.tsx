import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { AdminAccessAllowed } from '../../shared/routing/guards';
import { useAuth } from '../../shared/context/AuthContext';
import { canManageContent, canVerifyAccounts } from '../../shared/utils/permissions';
import AdminLayout from './components/AdminLayout';
const UsuariosAdmin = lazy(() => import('./pages/UsuariosAdmin'));
const RolesAdmin = lazy(() => import('./pages/RolesAdmin'));
const PermisosAdmin = lazy(() => import('./pages/PermisosAdmin'));
const ComerciosAdmin = lazy(() => import('./pages/ComerciosAdmin'));
const AuditoriaAdmin = lazy(() => import('./pages/AuditoriaAdmin'));
const VerificacionesAdmin = lazy(() => import('./pages/VerificacionesAdmin'));
const ContenidoAdmin = lazy(() => import('./pages/ContenidoAdmin'));

/** /admin para el verificador (sin permiso de configuración) va al back office. */
export function AdminIndex() {
  const { user } = useAuth();
  const canConfig = user?.role === 'admin' || !!user?.permissions?.includes('config');
  if (!canConfig) {
    if (canManageContent(user)) return <Navigate to="/admin/contenido" replace />;
    return <Navigate to="/admin/verificaciones" replace />;
  }
  return <AuditoriaAdmin />;
}

/** Cada página del panel exige su propio permiso; `/admin` decide el destino. */
function ConfigAllowed({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const canConfig = user?.role === 'admin' || !!user?.permissions?.includes('config');
  return canConfig ? <>{children}</> : <Navigate to="/admin" replace />;
}

function VerificationAllowed({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return canVerifyAccounts(user) ? <>{children}</> : <Navigate to="/admin" replace />;
}

function ContentAllowed({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return canManageContent(user) ? <>{children}</> : <Navigate to="/admin" replace />;
}

export const adminRoutes: React.ReactElement[] = [
  <Route key="admin" path="/admin" element={<AdminAccessAllowed><AdminLayout /></AdminAccessAllowed>}>
    <Route index element={<AdminIndex />} />
    <Route path="usuarios" element={<ConfigAllowed><UsuariosAdmin /></ConfigAllowed>} />
    <Route path="roles" element={<ConfigAllowed><RolesAdmin /></ConfigAllowed>} />
    <Route path="permisos" element={<ConfigAllowed><PermisosAdmin /></ConfigAllowed>} />
    <Route path="comercios" element={<ConfigAllowed><ComerciosAdmin /></ConfigAllowed>} />
    <Route path="verificaciones" element={<VerificationAllowed><VerificacionesAdmin /></VerificationAllowed>} />
    <Route path="contenido" element={<ContentAllowed><ContenidoAdmin /></ContentAllowed>} />
  </Route>,
];
