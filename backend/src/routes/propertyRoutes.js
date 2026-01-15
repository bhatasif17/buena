import { Router } from 'express';
import { propertyController } from '../controllers/index.js';
import { uploadDeclaration } from '../middleware/index.js';

const router = Router();

router.get('/', propertyController.getAll);
router.get('/:id', propertyController.getById);
router.post('/', uploadDeclaration, propertyController.create);
router.put('/:id', propertyController.update);
router.delete('/:id', propertyController.delete);

export default router;