const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    return successResponse(res, "Categories fetched successfully", db.categories, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch categories.", 500);
  }
};

module.exports = { getAllCategories };

