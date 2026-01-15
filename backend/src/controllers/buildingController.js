import { buildingService, propertyService } from '../services/index.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/index.js';

export const buildingController = {
  getByPropertyId: asyncHandler(async (req, res) => {
    const property = propertyService.findById(req.params.propertyId);

    if (!property) {
      throw new NotFoundError('Property');
    }

    const buildings = buildingService.findByPropertyId(req.params.propertyId);

    res.json({
      success: true,
      data: buildings
    });
  }),

  create: asyncHandler(async (req, res) => {
    const property = propertyService.findById(req.params.propertyId);

    if (!property) {
      throw new NotFoundError('Property');
    }

    const { name, street, house_number, postal_code, city, country, construction_year } = req.body;

    if (!street || !house_number) {
      throw new ValidationError('Street and house number are required');
    }

    const building = buildingService.create(req.params.propertyId, {
      name,
      street,
      house_number,
      postal_code,
      city,
      country,
      construction_year
    });

    res.status(201).json({
      success: true,
      data: building
    });
  }),

  update: asyncHandler(async (req, res) => {
    const existing = buildingService.findById(req.params.id);

    if (!existing) {
      throw new NotFoundError('Building');
    }

    const building = buildingService.update(req.params.id, {
      ...existing,
      ...req.body
    });

    res.json({
      success: true,
      data: building
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const deleted = buildingService.delete(req.params.id);

    if (!deleted) {
      throw new NotFoundError('Building');
    }

    res.status(204).send();
  })
};