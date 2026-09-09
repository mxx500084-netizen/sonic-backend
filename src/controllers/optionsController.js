const db = require("../config/db");
const { success } = require("../config/response");

// GET /api/toppings
const getToppings = (req, res) => {
  return success(res, db.toppings, "Toppings retrieved.");
};

// GET /api/side-options
const getSideOptions = (req, res) => {
  return success(res, db.sideOptions, "Side options retrieved.");
};

module.exports = { getToppings, getSideOptions };
