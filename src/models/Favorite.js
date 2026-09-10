const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  product_id: { type: Number, required: true, index: true },
  created_at: { type: Date, default: Date.now },
});

favoriteSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);
