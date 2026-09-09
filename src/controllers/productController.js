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

// GET /api/products?name=&category_id=&is_popular=&sort=
const getProducts = async (req, res) => {
  try {
    const { name, category_id, categoryId, is_popular, popular, sort } = req.query;
    let products = [...db.products];

    if (name) {
      const q = name.toLowerCase().trim();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.name_ar && p.name_ar.includes(name.trim())) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    const catId = category_id || categoryId;
    if (catId && catId !== "0" && catId !== "all") {
      products = products.filter((p) => p.category_id === parseInt(catId));
    }

    if (is_popular === "true" || popular === "true" || is_popular === "1") {
      products = products.filter((p) => p.is_popular);
    }

    if (sort === "price_asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    const userId = getUserIdFromReq(req);

    // Attach category info and is_favorite
    const result = products.map((p) => ({
      ...p,
      category: db.categories.find((c) => c.id === p.category_id) || null,
      is_favorite: userId
        ? db.favorites.some((f) => String(f.user_id) === String(userId) && f.product_id === p.id)
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
          ? db.favorites.some((f) => String(f.user_id) === String(userId) && f.product_id === id)
          : false,
      },
      200
    );
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch product.", 500);
  }
};

module.exports = { getProducts, getProductById };

