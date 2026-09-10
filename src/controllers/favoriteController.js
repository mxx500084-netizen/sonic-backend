const mongoose = require("mongoose");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");
const Favorite = require("../models/Favorite");
const Product = require("../models/Product");
const Category = require("../models/Category");

// POST /api/toggle-favorite
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const product_id = req.body.product_id || req.body.productId;

    if (!product_id) {
      return errorResponse(res, "product_id is required", 400);
    }

    const productIdNum = parseInt(product_id);

    let product;
    if (mongoose.connection.readyState === 1) {
      product = await Product.findOne({ id: productIdNum }).lean();
    } else {
      product = db.products.find((p) => p.id === productIdNum);
    }
    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    let isFavorite = false;
    if (mongoose.connection.readyState === 1) {
      const existing = await Favorite.findOne({ user_id: userId, product_id: productIdNum });
      if (existing) {
        await Favorite.deleteOne({ _id: existing._id });
        isFavorite = false;
      } else {
        await Favorite.create({ user_id: userId, product_id: productIdNum });
        isFavorite = true;
      }
    } else {
      const index = db.favorites.findIndex(
        (f) => String(f.user_id) === String(userId) && f.product_id === productIdNum
      );
      if (index !== -1) {
        db.favorites.splice(index, 1);
        isFavorite = false;
      } else {
        db.favorites.push({ user_id: userId, product_id: productIdNum });
        isFavorite = true;
      }
    }

    return successResponse(
      res,
      isFavorite ? "Added to favorites" : "Removed from favorites",
      { product_id: productIdNum, is_favorite: isFavorite },
      200
    );
  } catch (error) {
    return errorResponse(res, error.message || "Failed to toggle favorite.", 500);
  }
};

// GET /api/favorites
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    if (mongoose.connection.readyState === 1) {
      const [userFavorites, products, categories] = await Promise.all([
        Favorite.find({ user_id: userId }).lean(),
        Product.find().lean(),
        Category.find().lean(),
      ]);

      const result = userFavorites
        .map((f) => {
          const product = products.find((p) => p.id === f.product_id);
          if (!product) return null;
          const { _id, __v, ...pClean } = product;
          return {
            ...pClean,
            category: categories.find((c) => c.id === product.category_id) || null,
            is_favorite: true,
          };
        })
        .filter(Boolean);

      return successResponse(res, "Favorites fetched successfully", result, 200);
    }

    const userFavorites = db.favorites
      .filter((f) => String(f.user_id) === String(userId))
      .map((f) => {
        const product = db.products.find((p) => p.id === f.product_id);
        return product
          ? {
              ...product,
              category: db.categories.find((c) => c.id === product.category_id) || null,
              is_favorite: true,
            }
          : null;
      })
      .filter(Boolean);

    return successResponse(res, "Favorites fetched successfully", userFavorites, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch favorites.", 500);
  }
};

module.exports = { toggleFavorite, getFavorites };
