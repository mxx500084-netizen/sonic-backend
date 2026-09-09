const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");

// GET /api/toppings
const getToppings = async (req, res) => {
  try {
    return successResponse(res, "Toppings fetched successfully", db.toppings, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch toppings.", 500);
  }
};

// GET /api/side-options
const getSideOptions = async (req, res) => {
  try {
    return successResponse(res, "Side options fetched successfully", db.sideOptions, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch side options.", 500);
  }
};

module.exports = { getToppings, getSideOptions };

