const db = require("../config/db");
const { success, error } = require("../config/response");

// GET /api/products?name=&category_id=
const getProducts = (req, res) => {
  const { name, category_id } = req.query;
  let products = [...db.products];

  if (name) {
    products = products.filter((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (category_id) {
    products = products.filter((p) => p.category_id === parseInt(category_id));
  }

  // Attach category info
  const result = products.map((p) => ({
    ...p,
    category: db.categories.find((c) => c.id === p.category_id) || null,
    is_favorite: db.favorites.some(
      (f) => f.user_id === req.user.id && f.product_id === p.id
    ),
  }));

  return success(res, result, "Products retrieved.");
};

// GET /api/products/:id
const getProductById = (req, res) => {
  const id = parseInt(req.params.id);
  const product = db.products.find((p) => p.id === id);

  if (!product) return error(res, "Product not found.", 404);

  return success(res, {
    ...product,
    category: db.categories.find((c) => c.id === product.category_id) || null,
    is_favorite: db.favorites.some(
      (f) => f.user_id === req.user.id && f.product_id === id
    ),
  }, "Product retrieved.");
};

module.exports = { getProducts, getProductById };
