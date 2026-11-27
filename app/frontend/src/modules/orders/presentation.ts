import { ORDER_STATUS } from '../../shared/utils/constants';

/**
 * Presentación del módulo de pedidos. Las etiquetas siguen viniendo de
 * ORDER_STATUS: aquí solo se decide el color del badge, nunca el estado.
 */
export function orderStatusLabel(status: string, t?: (...args: any[]) => any): string {
  if (t) return t(`status.${status}`, { defaultValue: ORDER_STATUS[status]?.label ?? status });
  return ORDER_STATUS[status]?.label ?? status;
}

export function orderStatusBadgeClass(status: string): string {
  switch (status) {
    case 'entregado':
      return 'x-badge--success';
    case 'cancelado':
      return 'x-badge--danger';
    case 'confirmado':
    case 'preparando':
      return 'x-badge--warn';
    case 'nuevo':
    case 'despachado':
    case 'en_camino':
      return 'x-badge--primary';
    default:
      return '';
  }
}
