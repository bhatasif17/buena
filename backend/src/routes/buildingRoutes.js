import { Router } from 'express';
import { buildingController } from '../controllers/index.js';

const router = Router();

// Nested routes under /properties/:propertyId/buildings
router.get('/', buildingController.getByPropertyId);
router.post('/', buildingController.create);

// Direct routes for /buildings/:id
export const buildingDirectRouter = Router();
buildingDirectRouter.put('/:id', buildingController.update);
buildingDirectRouter.delete('/:id', buildingController.delete);

export default router;