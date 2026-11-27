import { lazy } from 'react';
import { Navigate, Route, useParams } from 'react-router-dom';
import { RequireAuth, RolesAllowed } from '../../../shared/routing/guards';
import { useAuth } from '../../../shared/context/AuthContext';
import RestaurantLayout from '../../../shared/ui/RestaurantLayout';

const Dashboard = lazy(() => import('../dashboard/pages/Dashboard'));
const Catalog = lazy(() => import('../../catalog/catalog/pages/Catalog'));
const Orders = lazy(() => import('../../orders/pages/Orders'));
const OrderDetail = lazy(() => import('../../orders/pages/OrderDetail'));
const CartPage = lazy(() => import('../../catalog/cart/pages/CartPage'));
const Invoices = lazy(() => import('../../finance/invoicing/pages/Invoices'));
const Accounting = lazy(() => import('../../finance/invoicing/pages/Accounting'));
const Plans = lazy(() => import('../../finance/plans/pages/Plans'));
const Inventory = lazy(() => import('../inventory/pages/Inventory'));
const Radar = lazy(() => import('../radar/pages/Radar'));
const Suppliers = lazy(() => import('../../catalog/directory/pages/Suppliers'));

const G = ({ children }: { children: React.ReactNode }) => (
  <RolesAllowed roles={['gerente']}>{children}</RolesAllowed>
);

const RL = ({ children }: { children: React.ReactNode }) => (
  <G><RestaurantLayout>{children}</RestaurantLayout></G>
);

function Legacy({ to, children }: { to: string; children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role === 'gerente') return <Navigate to={to} replace />;
  return <>{children}</>;
}

function LegacyOrderDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  if (user?.role === 'gerente') return <Navigate to={`/mercado/pedidos/${id ?? ''}`} replace />;
  return <OrderDetail />;
}

export const restaurantRoutes: React.ReactElement[] = [
  <Route key="r-mercado" path="/mercado" element={<Navigate to="/mercado/catalogo" replace />} />,
  <Route key="r-mercado-catalogo" path="/mercado/catalogo" element={<RL><Catalog /></RL>} />,
  <Route key="r-mercado-pedidos" path="/mercado/pedidos" element={<RL><Orders /></RL>} />,
  <Route key="r-mercado-pedido-detalle" path="/mercado/pedidos/:id" element={<RL><OrderDetail /></RL>} />,
  <Route key="r-mercado-carrito" path="/mercado/carrito" element={<RL><CartPage /></RL>} />,
  <Route key="r-mercado-proveedores" path="/mercado/proveedores" element={<RL><Suppliers /></RL>} />,

  <Route key="r-gestion" path="/gestion" element={<Navigate to="/gestion/inventario" replace />} />,
  <Route key="r-gestion-inventario" path="/gestion/inventario" element={<RL><Inventory /></RL>} />,
  <Route key="r-gestion-radar" path="/gestion/radar" element={<RL><Radar /></RL>} />,
  <Route key="r-gestion-facturacion" path="/gestion/facturacion" element={<RL><Invoices /></RL>} />,
  <Route key="r-gestion-contabilidad" path="/gestion/contabilidad" element={<RL><Accounting /></RL>} />,
  <Route key="r-gestion-planes" path="/gestion/planes" element={<RL><Plans /></RL>} />,

  // Compat shell previo
  <Route key="r-comercio" path="/comercio" element={<Navigate to="/gestion/facturacion" replace />} />,
  <Route key="r-comercio-facturacion" path="/comercio/facturacion" element={<Navigate to="/gestion/facturacion" replace />} />,
  <Route key="r-comercio-contabilidad" path="/comercio/contabilidad" element={<Navigate to="/gestion/contabilidad" replace />} />,
  <Route key="r-comercio-planes" path="/comercio/planes" element={<Navigate to="/gestion/planes" replace />} />,
  <Route key="r-admin" path="/administracion" element={<Navigate to="/gestion/inventario" replace />} />,
  <Route key="r-admin-inventario" path="/administracion/inventario" element={<Navigate to="/gestion/inventario" replace />} />,
  <Route key="r-admin-radar" path="/administracion/radar" element={<Navigate to="/gestion/radar" replace />} />,
  <Route key="r-admin-proveedores" path="/administracion/proveedores" element={<Navigate to="/mercado/proveedores" replace />} />,
];

const AjustesPage = lazy(() => import('../../../shared/ui/AjustesPage'));

export function RestaurantAjustesRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role === 'gerente') return <RestaurantLayout><AjustesPage /></RestaurantLayout>;
  return <>{children}</>;
}

export const restaurantLegacyRoutes: React.ReactElement[] = [
  <Route key="legacy-catalogo" path="/catalogo" element={<Legacy to="/mercado/catalogo"><RolesAllowed roles={['admin', 'gerente', 'proveedor_admin']}><Catalog /></RolesAllowed></Legacy>} />,
  <Route key="legacy-pedidos" path="/pedidos" element={<Legacy to="/mercado/pedidos"><RequireAuth><Orders /></RequireAuth></Legacy>} />,
  <Route key="legacy-pedido-id" path="/pedidos/:id" element={<RequireAuth><LegacyOrderDetail /></RequireAuth>} />,
  <Route key="legacy-carrito" path="/carrito" element={<Legacy to="/mercado/carrito"><RolesAllowed roles={['gerente']}><CartPage /></RolesAllowed></Legacy>} />,
  <Route key="legacy-facturacion" path="/facturacion" element={<Legacy to="/gestion/facturacion"><RolesAllowed roles={['admin', 'gerente', 'proveedor_admin']}><Invoices /></RolesAllowed></Legacy>} />,
  <Route key="legacy-contabilidad" path="/contabilidad" element={<Legacy to="/gestion/contabilidad"><RolesAllowed roles={['admin', 'gerente', 'proveedor_admin']}><Accounting /></RolesAllowed></Legacy>} />,
  <Route key="legacy-planes" path="/planes" element={<Legacy to="/gestion/planes"><RolesAllowed roles={['admin', 'gerente']}><Plans /></RolesAllowed></Legacy>} />,
  <Route key="legacy-inventario" path="/inventario" element={<Legacy to="/gestion/inventario"><RolesAllowed roles={['gerente']}><Inventory /></RolesAllowed></Legacy>} />,
  <Route key="legacy-radar" path="/radar" element={<Legacy to="/gestion/radar"><RolesAllowed roles={['admin', 'gerente', 'proveedor_admin']}><Radar /></RolesAllowed></Legacy>} />,
  <Route key="legacy-proveedores" path="/proveedores" element={<Legacy to="/mercado/proveedores"><RequireAuth><Suppliers /></RequireAuth></Legacy>} />,
];
