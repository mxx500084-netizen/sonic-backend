const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  name: { type: String, required: true },
  name_ar: { type: String, default: null },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  category_id: { type: Number, required: true, index: true },
  image: { type: String, default: "burger1.png" },
  image_url: { type: String, default: null },
  image_name: { type: String, default: null },
  rating: { type: Number, default: 4.8 },
  calories: { type: Number, default: 500 },
  prep_time: { type: String, default: "15-20 min" },
  spicy: { type: Number, default: 0.0 },
  is_popular: { type: Boolean, default: false },
});

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
