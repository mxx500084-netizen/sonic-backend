const mongoose = require("mongoose");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");
const Topping = require("../models/Topping");
const SideOption = require("../models/SideOption");

// GET /api/toppings
const getToppings = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const toppings = await Topping.find().lean();
      const clean = toppings.map(({ _id, __v, ...t }) => t);
      return successResponse(res, "Toppings fetched successfully", clean, 200);
    }
    return successResponse(res, "Toppings fetched successfully", db.toppings, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch toppings.", 500);
  }
};

// GET /api/side-options
const getSideOptions = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const sides = await SideOption.find().lean();
      const clean = sides.map(({ _id, __v, ...s }) => s);
      return successResponse(res, "Side options fetched successfully", clean, 200);
    }
    return successResponse(res, "Side options fetched successfully", db.sideOptions, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch side options.", 500);
  }
};

module.exports = { getToppings, getSideOptions };
