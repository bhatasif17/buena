import db from '../db/index.js';

export const suggestionService = {
  getStaffSuggestions() {
    const managers = db.prepare(
      'SELECT DISTINCT property_manager FROM properties WHERE property_manager IS NOT NULL AND property_manager != ""'
    ).all();

    const accountants = db.prepare(
      'SELECT DISTINCT accountant FROM properties WHERE accountant IS NOT NULL AND accountant != ""'
    ).all();

    return {
      managers: managers.map(m => m.property_manager),
      accountants: accountants.map(a => a.accountant)
    };
  }
};