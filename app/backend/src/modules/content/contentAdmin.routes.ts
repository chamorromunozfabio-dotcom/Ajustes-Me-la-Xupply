import { Router } from 'express';
import { authRequired, requirePermission } from '../../shared/middleware/auth';
import {
  createContent,
  getAdminContent,
  removeContent,
  toggleContent,
  updateContentRoute,
} from './content.controller';

/** Gestión del contenido: solo roles con `content:write`. */
const router = Router();
router.use(authRequired);
router.use(requirePermission('content:write'));
router.get('/', getAdminContent);
router.post('/', createContent);
router.put('/:id', updateContentRoute);
router.patch('/:id/toggle', toggleContent);
router.delete('/:id', removeContent);

export default router;
