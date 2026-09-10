const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");
const User = require("../models/User");
const BlacklistedToken = require("../models/BlacklistedToken");
const { getNextSequence } = require("../models/Counter");

// POST /api/register
const register = async (req, res) => {
  try {
    const { name, email, password, visa, phone, address, password_confirmation } = req.body;
    const userVisa = visa || req.body.visa_card || req.body.visa_number || req.body.card_number || req.body.cardNumber;

    if (!name || !email || !password) {
      return errorResponse(res, "name, email, and password are required.", 422);
    }

    if (password_confirmation && password !== password_confirmation) {
      return errorResponse(res, "Passwords do not match.", 422);
    }

    const cleanEmail = String(email).toLowerCase().trim();

    let existing;
    if (mongoose.connection.readyState === 1) {
      existing = await User.findOne({ email: cleanEmail });
    } else {
      existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    }
    if (existing) return errorResponse(res, "Email already registered.", 422);

    let userId;
    if (mongoose.connection.readyState === 1) {
      userId = await getNextSequence("userId");
    } else {
      userId = db.userIdCounter++;
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const image = req.file ? req.file.filename : null;

    const userData = {
      id: userId,
      name,
      email: cleanEmail,
      visa: userVisa ? String(userVisa) : "4111222233334444",
      image,
      address: address || null,
      password: hashedPassword,
      created_at: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      await User.create(userData);
    }
    db.users.push(userData);

    const token = jwt.sign({ id: userData.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    const { password: _, ...userWithoutPassword } = userData;
    return successResponse(
      res,
      "Registration successful",
      { token, ...userWithoutPassword, user: userWithoutPassword },
      201
    );
  } catch (error) {
    return errorResponse(res, error.message || "Registration failed.", 500);
  }
};

// POST /api/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required.", 422);
    }

    const cleanEmail = String(email).toLowerCase().trim();

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: cleanEmail }).lean();
    } else {
      user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return errorResponse(res, "Email not found.", 401, { email: "Email not found." });
    }

    const valid = await bcrypt.compare(String(password), user.password);
    if (!valid) {
      return errorResponse(res, "Incorrect password.", 401, { password: "Incorrect password." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    const { password: _, ...userData } = user;
    return successResponse(
      res,
      "Login successful",
      { token, ...userData, user: userData },
      200
    );
  } catch (error) {
    return errorResponse(res, error.message || "Login failed.", 500);
  }
};

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const { password: _, ...userData } = req.user;
    return successResponse(res, "Profile fetched", userData, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/update-profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, address, visa } = req.body;
    const userVisa = visa || req.body.visa_card || req.body.visa_number || req.body.card_number;

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ id: req.user.id });
    } else {
      user = db.users.find((u) => u.id === req.user.id);
    }
    if (!user) return errorResponse(res, "User not found.", 404);

    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      let emailTaken;
      if (mongoose.connection.readyState === 1) {
        emailTaken = await User.findOne({ email: cleanEmail, id: { $ne: user.id } });
      } else {
        emailTaken = db.users.find((u) => u.email.toLowerCase() === cleanEmail && u.id !== user.id);
      }
      if (emailTaken) return errorResponse(res, "Email already in use.", 422);
      user.email = cleanEmail;
    }

    if (name) user.name = name;
    if (address) user.address = address;
    if (userVisa) user.visa = String(userVisa);
    if (req.file) user.image = req.file.filename;

    if (mongoose.connection.readyState === 1 && typeof user.save === "function") {
      await user.save();
    }

    // Keep memory store in sync
    const memUser = db.users.find((u) => u.id === req.user.id);
    if (memUser) {
      if (name) memUser.name = name;
      if (email) memUser.email = user.email;
      if (address) memUser.address = address;
      if (userVisa) memUser.visa = String(userVisa);
      if (req.file) memUser.image = req.file.filename;
    }

    const { password: _, ...userData } = user.toObject ? user.toObject() : user;
    return successResponse(res, "Profile updated successfully", userData, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Update failed.", 500);
  }
};

// POST /api/logout
const logout = async (req, res) => {
  try {
    if (req.token) {
      db.blacklistedTokens.add(req.token);
      if (mongoose.connection.readyState === 1) {
        await BlacklistedToken.create({ token: req.token }).catch(() => {});
      }
    }
    return successResponse(res, "Logged out successfully", null, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
};
