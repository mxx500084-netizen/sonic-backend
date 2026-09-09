const db = require("../config/db");
const { success, error } = require("../config/response");

// POST /api/toggle-favorite
const toggleFavorite = (req, res) => {
  const { product_id } = req.body;
  const user_id = req.user.id;

  if (!product_id) return error(res, "product_id is required.", 422);

  const product = db.products.find((p) => p.id === parseInt(product_id));
  if (!product) return error(res, "Product not found.", 404);

  const index = db.favorites.findIndex(
    (f) => f.user_id === user_id && f.product_id === parseInt(product_id)
  );

  if (index !== -1) {
    db.favorites.splice(index, 1);
    return success(res, { is_favorite: false }, "Removed from favorites.");
  } else {
    db.favorites.push({ user_id, product_id: parseInt(product_id) });
    return success(res, { is_favorite: true }, "Added to favorites.");
  }
};

// GET /api/favorites
const getFavorites = (req, res) => {
  const user_id = req.user.id;
  const userFavorites = db.favorites
    .filter((f) => f.user_id === user_id)
    .map((f) => {
      const product = db.products.find((p) => p.id === f.product_id);
      return product
        ? { ...product, category: db.categories.find((c) => c.id === product.category_id) }
        : null;
    })
    .filter(Boolean);

  return success(res, userFavorites, "Favorites retrieved.");
};

module.exports = { toggleFavorite, getFavorites };
