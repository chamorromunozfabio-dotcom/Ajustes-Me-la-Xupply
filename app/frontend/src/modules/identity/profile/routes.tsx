import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '../../../shared/routing/guards';
import { RestaurantAjustesRoute } from '../../operations/restaurant/routes';
const MyProfile = lazy(() => import('./pages/MyProfile'));
const AjustesPage = lazy(() => import('../../../shared/ui/AjustesPage'));

export const profileRoutes: React.ReactElement[] = [
  <Route key="profile" path="/mi-perfil" element={<RequireAuth><MyProfile /></RequireAuth>} />,
  <Route key="ajustes" path="/ajustes" element={<RequireAuth><RestaurantAjustesRoute><AjustesPage /></RestaurantAjustesRoute></RequireAuth>} />,
];
