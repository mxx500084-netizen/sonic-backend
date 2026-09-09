const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const { success, error } = require("../config/response");

// POST /api/register
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return error(res, "name, email, phone, and password are required.", 422);
    }

    const existing = db.users.find((u) => u.email === email);
    if (existing) return error(res, "Email already registered.", 422);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: uuidv4(),
      name,
      email,
      phone,
      password: hashedPassword,
      image: req.file ? req.file.filename : null,
      address: null,
      created_at: new Date().toISOString(),
    };

    db.users.push(user);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const { password: _, ...userData } = user;
    return success(res, { user: userData, token }, "Registered successfully.", 201);
  } catch (err) {
    return error(res, "Registration failed.", 500);
  }
};

// POST /api/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, "Email and password are required.", 422);
    }

    const user = db.users.find((u) => u.email === email);
    if (!user) return error(res, "Invalid credentials.", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return error(res, "Invalid credentials.", 401);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const { password: _, ...userData } = user;
    return success(res, { user: userData, token }, "Logged in successfully.");
  } catch (err) {
    return error(res, "Login failed.", 500);
  }
};

// POST /api/logout
const logout = (req, res) => {
  db.blacklistedTokens.add(req.token);
  return success(res, null, "Logged out successfully.");
};

// GET /api/profile
const getProfile = (req, res) => {
  const { password, ...userData } = req.user;
  return success(res, userData, "Profile retrieved.");
};

// POST /api/update-profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id;
    const userIndex = db.users.findIndex((u) => u.id === userId);

    if (email && email !== req.user.email) {
      const emailTaken = db.users.find((u) => u.email === email && u.id !== userId);
      if (emailTaken) return error(res, "Email already in use.", 422);
    }

    const user = db.users[userIndex];
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (req.file) user.image = req.file.filename;

    db.users[userIndex] = user;

    const { password, ...userData } = user;
    return success(res, userData, "Profile updated successfully.");
  } catch (err) {
    return error(res, "Update failed.", 500);
  }
};

module.exports = { register, login, logout, getProfile, updateProfile };
