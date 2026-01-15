import { unitService, buildingService } from '../services/index.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/index.js';

const VALID_UNIT_TYPES = ['Apartment', 'Office', 'Garden', 'Parking'];

export const unitController = {
  getByBuildingId: asyncHandler(async (req, res) => {
    const building = buildingService.findById(req.params.buildingId);

    if (!building) {
      throw new NotFoundError('Building');
    }

    const units = unitService.findByBuildingId(req.params.buildingId);

    res.json({
      success: true,
      data: units
    });
  }),

  create: asyncHandler(async (req, res) => {
    const building = buildingService.findById(req.params.buildingId);

    if (!building) {
      throw new NotFoundError('Building');
    }

    const { unit_number, type } = req.body;

    if (!unit_number || !type) {
      throw new ValidationError('Unit number and type are required');
    }

    if (!VALID_UNIT_TYPES.includes(type)) {
      throw new ValidationError(`Type must be one of: ${VALID_UNIT_TYPES.join(', ')}`);
    }

    const unit = unitService.create(req.params.buildingId, req.body);

    res.status(201).json({
      success: true,
      data: unit
    });
  }),

  createBulk: asyncHandler(async (req, res) => {
    const building = buildingService.findById(req.params.buildingId);

    if (!building) {
      throw new NotFoundError('Building');
    }

    const { units } = req.body;

    if (!Array.isArray(units) || units.length === 0) {
      throw new ValidationError('Units array is required and must not be empty');
    }

    // Validate all units
    for (const unit of units) {
      if (!unit.unit_number || !unit.type) {
        throw new ValidationError('Each unit must have unit_number and type');
      }
      if (!VALID_UNIT_TYPES.includes(unit.type)) {
        throw new ValidationError(`Type must be one of: ${VALID_UNIT_TYPES.join(', ')}`);
      }
    }

    const createdUnits = unitService.createBulk(req.params.buildingId, units);

    res.status(201).json({
      success: true,
      data: createdUnits
    });
  }),

  update: asyncHandler(async (req, res) => {
    const existing = unitService.findById(req.params.id);

    if (!existing) {
      throw new NotFoundError('Unit');
    }

    if (req.body.type && !VALID_UNIT_TYPES.includes(req.body.type)) {
      throw new ValidationError(`Type must be one of: ${VALID_UNIT_TYPES.join(', ')}`);
    }

    const unit = unitService.update(req.params.id, {
      ...existing,
      ...req.body
    });

    res.json({
      success: true,
      data: unit
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const deleted = unitService.delete(req.params.id);

    if (!deleted) {
      throw new NotFoundError('Unit');
    }

    res.status(204).send();
  })
};