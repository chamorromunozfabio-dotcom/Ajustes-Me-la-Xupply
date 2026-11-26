import { Router } from 'express';
import { getPublicContent } from './content.controller';

/** Contenido público de la landing: accesible sin sesión. */
const router = Router();
router.get('/', getPublicContent);

export default router;
