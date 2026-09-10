const mongoose = require("mongoose");

const sideOptionSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  name: { type: String, required: true },
  name_ar: { type: String, default: null },
  price: { type: Number, required: true },
});

module.exports = mongoose.models.SideOption || mongoose.model("SideOption", sideOptionSchema);
