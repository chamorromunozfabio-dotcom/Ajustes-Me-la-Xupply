import { User } from '../types';

/** Accede al panel /admin (administración, verificaciones o contenido). */
export const hasAdminAccess = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return (
    user.role === 'admin' ||
    user.role === 'verificador' ||
    user.role === 'tecnico' ||
    !!user.permissions?.includes('config') ||
    !!user.permissions?.includes('verificacion') ||
    canManageContent(user)
  );
};

/** Puede editar banners, noticias y textos de la landing. */
export const canManageContent = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return user.role === 'tecnico' || !!user.permissions?.includes('content:write');
};

export const canVerifyAccounts = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return (
    user.role === 'admin' ||
    user.role === 'verificador' ||
    !!user.permissions?.includes('verificacion')
  );
};
