import { Router } from 'express';
import propertyRoutes from './propertyRoutes.js';
import buildingRoutes, { buildingDirectRouter } from './buildingRoutes.js';
import unitRoutes, { unitDirectRouter } from './unitRoutes.js';
import suggestionRoutes from './suggestionRoutes.js';

const router = Router();

// Property routes
router.use('/properties', propertyRoutes);

// Nested building routes under properties
router.use('/properties/:propertyId/buildings', (req, res, next) => {
  req.params.propertyId = req.params.propertyId;
  next();
}, buildingRoutes);

// Direct building routes
router.use('/buildings', buildingDirectRouter);

// Nested unit routes under buildings
router.use('/buildings/:buildingId/units', (req, res, next) => {
  req.params.buildingId = req.params.buildingId;
  next();
}, unitRoutes);

// Direct unit routes
router.use('/units', unitDirectRouter);

// Suggestion routes
router.use('/suggestions', suggestionRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
