const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");

const { register, login, logout, getProfile, updateProfile } = require("../controllers/authController");
const { getAllCategories } = require("../controllers/categoryController");
const { getProducts, getProductById } = require("../controllers/productController");
const { toggleFavorite, getFavorites } = require("../controllers/favoriteController");
const { getToppings, getSideOptions } = require("../controllers/optionsController");
const { saveOrder, getOrders, getOrderById } = require("../controllers/orderController");
const { addToCart, getCart, removeFromCart } = require("../controllers/cartController");

// ─── Auth ────────────────────────────────────────────────
router.post("/register", upload.single("image"), register);
router.post("/login", login);
router.post("/logout", authenticate, logout);

// ─── Profile ─────────────────────────────────────────────
router.get("/profile", authenticate, getProfile);
router.post("/update-profile", authenticate, upload.single("image"), updateProfile);

// ─── Categories ───────────────────────────────────────────
router.get("/categories", getAllCategories);

// ─── Products ─────────────────────────────────────────────
router.get("/products", authenticate, getProducts);
router.get("/products/:id", authenticate, getProductById);

// ─── Favorites ────────────────────────────────────────────
router.post("/toggle-favorite", authenticate, toggleFavorite);
router.get("/favorites", authenticate, getFavorites);

// ─── Product Options ──────────────────────────────────────
router.get("/toppings", authenticate, getToppings);
router.get("/side-options", authenticate, getSideOptions);

// ─── Orders ───────────────────────────────────────────────
router.post("/orders", authenticate, saveOrder);
router.get("/orders", authenticate, getOrders);
router.get("/orders/:id", authenticate, getOrderById);

// ─── Cart ─────────────────────────────────────────────────
router.post("/cart/add", authenticate, addToCart);
router.get("/cart", authenticate, getCart);
router.delete("/cart/remove/:id", authenticate, removeFromCart);

module.exports = router;
