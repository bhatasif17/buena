import db from '../db/index.js';
import { generateId, generatePropertyNumber } from '../utils/index.js';

export const propertyService = {
  findAll() {
    return db.prepare(`
      SELECT
        p.*,
        COUNT(DISTINCT b.id) as building_count,
        COUNT(DISTINCT u.id) as unit_count
      FROM properties p
      LEFT JOIN buildings b ON b.property_id = p.id
      LEFT JOIN units u ON u.building_id = b.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all();
  },

  findById(id) {
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(id);
    if (!property) return null;

    const buildings = db.prepare('SELECT * FROM buildings WHERE property_id = ?').all(id);
    const buildingIds = buildings.map(b => b.id);

    let units = [];
    if (buildingIds.length > 0) {
      const placeholders = buildingIds.map(() => '?').join(',');
      units = db.prepare(`SELECT * FROM units WHERE building_id IN (${placeholders})`).all(...buildingIds);
    }

    return { ...property, buildings, units };
  },

  create({ name, type, property_manager, accountant, declaration_file, buildings = [], units = [] }) {
    const propertyId = generateId();
    const count = db.prepare('SELECT COUNT(*) as count FROM properties').get().count;
    const propertyNumber = generatePropertyNumber(count);

    // Insert property
    db.prepare(`
      INSERT INTO properties (id, name, type, property_number, property_manager, accountant, declaration_file)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(propertyId, name, type, propertyNumber, property_manager, accountant, declaration_file);

    // Insert buildings and create ID mapping
    const buildingIdMap = {};
    const insertBuilding = db.prepare(`
      INSERT INTO buildings (id, property_id, name, street, house_number, postal_code, city, country, construction_year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const building of buildings) {
      const buildingId = generateId();
      buildingIdMap[building.tempId || building.id] = buildingId;
      insertBuilding.run(
        buildingId,
        propertyId,
        building.name || null,
        building.street,
        building.house_number,
        building.postal_code || null,
        building.city || null,
        building.country || 'Germany',
        building.construction_year || null
      );
    }

    // Insert units
    const insertUnit = db.prepare(`
      INSERT INTO units (id, building_id, unit_number, type, floor, entrance, size_sqm, co_ownership_share, construction_year, rooms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const unit of units) {
      const buildingId = buildingIdMap[unit.building_id] || unit.building_id;
      insertUnit.run(
        generateId(),
        buildingId,
        unit.unit_number,
        unit.type,
        unit.floor || null,
        unit.entrance || null,
        unit.size_sqm || null,
        unit.co_ownership_share || null,
        unit.construction_year || null,
        unit.rooms || null
      );
    }

    return db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId);
  },

  update(id, { name, type, property_manager, accountant }) {
    db.prepare(`
      UPDATE properties
      SET name = ?, type = ?, property_manager = ?, accountant = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, type, property_manager, accountant, id);

    return db.prepare('SELECT * FROM properties WHERE id = ?').get(id);
  },

  delete(id) {
    const result = db.prepare('DELETE FROM properties WHERE id = ?').run(id);
    return result.changes > 0;
  }
};