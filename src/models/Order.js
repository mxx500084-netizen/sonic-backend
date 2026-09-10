const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  items: { type: Array, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: "pending" },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
