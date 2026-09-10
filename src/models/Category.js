const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  name: { type: String, required: true },
  name_ar: { type: String, default: null },
  description: { type: String, default: null },
  image: { type: String, default: "default.png" },
  image_url: { type: String, default: null },
});

module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema);
