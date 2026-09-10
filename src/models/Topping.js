const mongoose = require("mongoose");

const toppingSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  name: { type: String, required: true },
  name_ar: { type: String, default: null },
  price: { type: Number, required: true },
});

module.exports = mongoose.models.Topping || mongoose.model("Topping", toppingSchema);
