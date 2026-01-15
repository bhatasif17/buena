import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import config from '../config/index.js';

// Ensure data directory exists
const dataDir = dirname(config.paths.database);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new Database(config.paths.database);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('WEG', 'MV')),
    property_number TEXT UNIQUE NOT NULL,
    property_manager TEXT,
    accountant TEXT,
    declaration_file TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS buildings (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    name TEXT,
    street TEXT NOT NULL,
    house_number TEXT NOT NULL,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'Germany',
    construction_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL,
    unit_number TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Apartment', 'Office', 'Garden', 'Parking')),
    floor INTEGER,
    entrance TEXT,
    size_sqm REAL,
    co_ownership_share REAL,
    construction_year INTEGER,
    rooms INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_buildings_property ON buildings(property_id);
  CREATE INDEX IF NOT EXISTS idx_units_building ON units(building_id);
`);

export default db;