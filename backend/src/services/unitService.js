import db from '../db/index.js';
import { generateId } from '../utils/index.js';

export const unitService = {
  findByBuildingId(buildingId) {
    return db.prepare('SELECT * FROM units WHERE building_id = ?').all(buildingId);
  },

  findById(id) {
    return db.prepare('SELECT * FROM units WHERE id = ?').get(id);
  },

  create(buildingId, { unit_number, type, floor, entrance, size_sqm, co_ownership_share, construction_year, rooms }) {
    const unitId = generateId();

    db.prepare(`
      INSERT INTO units (id, building_id, unit_number, type, floor, entrance, size_sqm, co_ownership_share, construction_year, rooms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      unitId,
      buildingId,
      unit_number,
      type,
      floor || null,
      entrance || null,
      size_sqm || null,
      co_ownership_share || null,
      construction_year || null,
      rooms || null
    );

    return db.prepare('SELECT * FROM units WHERE id = ?').get(unitId);
  },

  createBulk(buildingId, units) {
    const insertUnit = db.prepare(`
      INSERT INTO units (id, building_id, unit_number, type, floor, entrance, size_sqm, co_ownership_share, construction_year, rooms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdUnits = [];

    for (const unit of units) {
      const unitId = generateId();
      insertUnit.run(
        unitId,
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
      createdUnits.push({ ...unit, id: unitId, building_id: buildingId });
    }

    return createdUnits;
  },

  update(id, { unit_number, type, floor, entrance, size_sqm, co_ownership_share, construction_year, rooms }) {
    db.prepare(`
      UPDATE units
      SET unit_number = ?, type = ?, floor = ?, entrance = ?, size_sqm = ?, co_ownership_share = ?, construction_year = ?, rooms = ?
      WHERE id = ?
    `).run(unit_number, type, floor, entrance, size_sqm, co_ownership_share, construction_year, rooms, id);

    return db.prepare('SELECT * FROM units WHERE id = ?').get(id);
  },

  delete(id) {
    const result = db.prepare('DELETE FROM units WHERE id = ?').run(id);
    return result.changes > 0;
  }
};