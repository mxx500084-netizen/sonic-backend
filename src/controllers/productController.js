const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse } = require("../config/response");

const getUserIdFromReq = (req) => {
  if (req.user?.id) return req.user.id;
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      if (!db.blacklistedTokens.has(token)) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded?.id;
      }
    } catch (e) {
      // ignore token error on public route
    }
  }
  return null;
};

// GET /api/products?name=&category_id=
const getProducts = async (req, res) => {
  try {
    const { name, category_id, categoryId } = req.query;
    let products = [...db.products];

    if (name) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    const catId = category_id || categoryId;
    if (catId) {
      products = products.filter((p) => p.category_id === parseInt(catId));
    }

    const userId = getUserIdFromReq(req);

    // Attach category info and is_favorite
    const result = products.map((p) => ({
      ...p,
      category: db.categories.find((c) => c.id === p.category_id) || null,
      is_favorite: userId
        ? db.favorites.some((f) => f.user_id === userId && f.product_id === p.id)
        : false,
    }));

    return successResponse(res, "Products fetched successfully", result, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch products.", 500);
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = db.products.find((p) => p.id === id);

    if (!product) return errorResponse(res, "Product not found.", 404);

    const userId = getUserIdFromReq(req);

    return successResponse(
      res,
      "Product fetched successfully",
      {
        ...product,
        category: db.categories.find((c) => c.id === product.category_id) || null,
        is_favorite: userId
          ? db.favorites.some((f) => f.user_id === userId && f.product_id === id)
          : false,
      },
      200
    );
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch product.", 500);
  }
};

module.exports = { getProducts, getProductById };

