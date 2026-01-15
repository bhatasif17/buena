import { Router } from 'express';
import { suggestionController } from '../controllers/index.js';

const router = Router();

router.get('/staff', suggestionController.getStaff);

export default router;
