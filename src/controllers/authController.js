const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");

// POST /api/register
const register = async (req, res) => {
  try {
    const { name, email, password, visa, phone, address, password_confirmation } = req.body;
    const userVisa = visa || req.body.visa_card || req.body.visa_number || req.body.card_number || req.body.cardNumber;

    if (!name || !email || !password || !userVisa) {
      return errorResponse(res, "name, email, password, and visa are required.", 422);
    }

    if (password_confirmation && password !== password_confirmation) {
      return errorResponse(res, "Passwords do not match.", 422);
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) return errorResponse(res, "Email already registered.", 422);

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const image = req.file ? req.file.filename : null;

    const user = {
      id: db.userIdCounter++,
      name,
      email: cleanEmail,
      phone: phone ? String(phone) : null,
      visa: String(userVisa),
      address: address || null,
      password: hashedPassword,
      image,
      created_at: new Date().toISOString(),
    };

    db.users.push(user);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    const { password: _, ...userData } = user;
    return successResponse(
      res,
      "Registration successful",
      { token, ...userData, user: userData },
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
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return errorResponse(res, "Invalid credentials.", 401);

    const valid = await bcrypt.compare(String(password), user.password);
    if (!valid) return errorResponse(res, "Invalid credentials.", 401);

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
    const { name, email, phone, address, visa } = req.body;
    const userId = req.user.id;
    const userIndex = db.users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return errorResponse(res, "User not found.", 404);
    }

    if (email && email !== req.user.email) {
      const emailTaken = db.users.find((u) => u.email === email && u.id !== userId);
      if (emailTaken) return errorResponse(res, "Email already in use.", 422);
    }

    const user = db.users[userIndex];
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (visa !== undefined) user.visa = String(visa);
    if (req.file) user.image = req.file.filename;

    db.users[userIndex] = user;

    const { password: _, ...userData } = user;
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
    }
    return successResponse(res, "Logged out successfully", null, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
};

