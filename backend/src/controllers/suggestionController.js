import { suggestionService } from '../services/index.js';
import { asyncHandler } from '../middleware/index.js';

export const suggestionController = {
  getStaff: asyncHandler(async (req, res) => {
    const suggestions = suggestionService.getStaffSuggestions();

    res.json({
      success: true,
      data: suggestions
    });
  })
};