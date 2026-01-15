import db from '../db/index.js';
import { generateId } from '../utils/index.js';

export const buildingService = {
  findByPropertyId(propertyId) {
    return db.prepare('SELECT * FROM buildings WHERE property_id = ?').all(propertyId);
  },

  findById(id) {
    return db.prepare('SELECT * FROM buildings WHERE id = ?').get(id);
  },

  create(propertyId, { name, street, house_number, postal_code, city, country, construction_year }) {
    const buildingId = generateId();

    db.prepare(`
      INSERT INTO buildings (id, property_id, name, street, house_number, postal_code, city, country, construction_year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      buildingId,
      propertyId,
      name || null,
      street,
      house_number,
      postal_code || null,
      city || null,
      country || 'Germany',
      construction_year || null
    );

    return db.prepare('SELECT * FROM buildings WHERE id = ?').get(buildingId);
  },

  update(id, { name, street, house_number, postal_code, city, country, construction_year }) {
    db.prepare(`
      UPDATE buildings
      SET name = ?, street = ?, house_number = ?, postal_code = ?, city = ?, country = ?, construction_year = ?
      WHERE id = ?
    `).run(name, street, house_number, postal_code, city, country, construction_year, id);

    return db.prepare('SELECT * FROM buildings WHERE id = ?').get(id);
  },

  delete(id) {
    const result = db.prepare('DELETE FROM buildings WHERE id = ?').run(id);
    return result.changes > 0;
  }
};