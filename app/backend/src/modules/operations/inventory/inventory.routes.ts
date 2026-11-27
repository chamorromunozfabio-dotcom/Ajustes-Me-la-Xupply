import { Router } from 'express';
import { authRequired, roleRequired } from '../../../shared/middleware/auth';
import { list, alerts, predictions, create, update, addMovement } from './inventory.controller';

const router = Router();
router.use(authRequired);

router.get('/', list);
router.get('/alerts', alerts);
router.get('/predictions', predictions);
router.post('/', roleRequired('gerente', 'admin'), create);
router.put('/:id', roleRequired('gerente', 'admin'), update);
router.post('/:id/movements', roleRequired('gerente', 'admin'), addMovement);

export default router;
