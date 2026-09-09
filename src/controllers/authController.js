const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");

// POST /api/register
const register = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !phone || !password) {
      return errorResponse(res, "name, email, phone, and password are required.", 422);
    }

    const existing = db.users.find((u) => u.email === email);
    if (existing) return errorResponse(res, "Email already registered.", 422);

    const hashedPassword = await bcrypt.hash(password, 10);
    const image = req.file ? req.file.filename : null;

    const user = {
      id: uuidv4(),
      name,
      email,
      phone,
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

    const user = db.users.find((u) => u.email === email);
    if (!user) return errorResponse(res, "Invalid credentials.", 401);

    const valid = await bcrypt.compare(password, user.password);
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
    const { name, email, phone, address } = req.body;
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

