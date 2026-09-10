const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  product_id: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  spicy: { type: Number, default: 0.0 },
  toppings: [{ type: Number }],
  side_options: [{ type: Number }],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.models.CartItem || mongoose.model("CartItem", cartItemSchema);
