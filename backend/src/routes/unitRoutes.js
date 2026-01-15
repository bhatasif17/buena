import { Router } from 'express';
import { unitController } from '../controllers/index.js';

const router = Router();

// Nested routes under /buildings/:buildingId/units
router.get('/', unitController.getByBuildingId);
router.post('/', unitController.create);
router.post('/bulk', unitController.createBulk);

// Direct routes for /units/:id
export const unitDirectRouter = Router();
unitDirectRouter.put('/:id', unitController.update);
unitDirectRouter.delete('/:id', unitController.delete);

export default router;