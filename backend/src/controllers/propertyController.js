import { propertyService } from '../services/index.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/index.js';

export const propertyController = {
  getAll: asyncHandler(async (req, res) => {
    const properties = propertyService.findAll();
    res.json({
      success: true,
      data: properties
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const property = propertyService.findById(req.params.id);

    if (!property) {
      throw new NotFoundError('Property');
    }

    res.json({
      success: true,
      data: property
    });
  }),

  create: asyncHandler(async (req, res) => {
    const { name, type, property_manager, accountant, buildings, units } = req.body;

    if (!name || !type) {
      throw new ValidationError('Name and type are required');
    }

    if (!['WEG', 'MV'].includes(type)) {
      throw new ValidationError('Type must be either WEG or MV');
    }

    // Parse JSON strings if they come from form data
    const buildingsData = typeof buildings === 'string' ? JSON.parse(buildings) : buildings || [];
    const unitsData = typeof units === 'string' ? JSON.parse(units) : units || [];

    const property = propertyService.create({
      name,
      type,
      property_manager: property_manager || null,
      accountant: accountant || null,
      declaration_file: req.file?.filename || null,
      buildings: buildingsData,
      units: unitsData
    });

    res.status(201).json({
      success: true,
      data: property
    });
  }),

  update: asyncHandler(async (req, res) => {
    const existing = propertyService.findById(req.params.id);

    if (!existing) {
      throw new NotFoundError('Property');
    }

    const { name, type, property_manager, accountant } = req.body;

    if (type && !['WEG', 'MV'].includes(type)) {
      throw new ValidationError('Type must be either WEG or MV');
    }

    const property = propertyService.update(req.params.id, {
      name: name || existing.name,
      type: type || existing.type,
      property_manager: property_manager ?? existing.property_manager,
      accountant: accountant ?? existing.accountant
    });

    res.json({
      success: true,
      data: property
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const deleted = propertyService.delete(req.params.id);

    if (!deleted) {
      throw new NotFoundError('Property');
    }

    res.status(204).send();
  })
};