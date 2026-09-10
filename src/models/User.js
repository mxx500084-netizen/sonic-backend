const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  visa: { type: String, default: "4111222233334444" },
  image: { type: String, default: null },
  address: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
