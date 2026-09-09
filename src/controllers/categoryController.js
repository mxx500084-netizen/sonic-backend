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

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, name_ar, description, image } = req.body;
    if (!name) return errorResponse(res, "Category name is required", 400);

    const newId = db.categories.length > 0 ? Math.max(...db.categories.map((c) => c.id)) + 1 : 1;
    const newCategory = {
      id: newId,
      name,
      name_ar: name_ar || name,
      description: description || null,
      image: image || "default.png",
      image_url: req.body.image_url || null,
    };
    db.categories.push(newCategory);
    return successResponse(res, "Category created successfully", newCategory, 201);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to create category.", 500);
  }
};

module.exports = { getAllCategories, createCategory };

