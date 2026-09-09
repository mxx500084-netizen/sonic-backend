const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");

// POST /api/toggle-favorite
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const product_id = req.body.product_id || req.body.productId;

    if (!product_id) {
      return errorResponse(res, "product_id is required", 400);
    }

    const productIdNum = parseInt(product_id);
    const product = db.products.find((p) => p.id === productIdNum);
    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    const index = db.favorites.findIndex(
      (f) => f.user_id === userId && f.product_id === productIdNum
    );

    let isFavorite = false;
    if (index !== -1) {
      db.favorites.splice(index, 1);
      isFavorite = false;
    } else {
      db.favorites.push({ user_id: userId, product_id: productIdNum });
      isFavorite = true;
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
    const userFavorites = db.favorites
      .filter((f) => f.user_id === userId)
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
