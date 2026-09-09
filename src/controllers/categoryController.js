const db = require("../config/db");
const { success } = require("../config/response");

// GET /api/categories
const getAllCategories = (req, res) => {
  return success(res, db.categories, "Categories retrieved.");
};

module.exports = { getAllCategories };
