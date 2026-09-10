const mongoose = require("mongoose");

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  created_at: { type: Date, default: Date.now, expires: "7d" },
});

module.exports = mongoose.models.BlacklistedToken || mongoose.model("BlacklistedToken", blacklistedTokenSchema);
