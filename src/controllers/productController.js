const mongoose = require("mongoose");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse } = require("../config/response");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Favorite = require("../models/Favorite");
const { getNextSequence } = require("../models/Counter");

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
    const userId = getUserIdFromReq(req);
    const catId = category_id || categoryId;

    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (name) {
        const q = name.trim();
        query.$or = [
          { name: { $regex: q, $options: "i" } },
          { name_ar: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ];
      }

      if (catId && catId !== "0" && catId !== "all") {
        query.category_id = parseInt(catId);
      }

      if (is_popular === "true" || popular === "true" || is_popular === "1") {
        query.is_popular = true;
      }

      let sortOptions = {};
      if (sort === "price_asc") sortOptions.price = 1;
      else if (sort === "price_desc") sortOptions.price = -1;
      else if (sort === "rating") sortOptions.rating = -1;

      const [products, categories, favorites] = await Promise.all([
        Product.find(query).sort(sortOptions).lean(),
        Category.find().lean(),
        userId ? Favorite.find({ user_id: userId }).lean() : Promise.resolve([]),
      ]);

      const result = products.map((p) => {
        const { _id, __v, ...item } = p;
        return {
          ...item,
          category: categories.find((c) => c.id === item.category_id) || null,
          is_favorite: favorites.some((f) => f.product_id === item.id),
        };
      });

      return successResponse(res, "Products fetched successfully", result, 200);
    }

    // Fallback to in-memory store
    let products = [...db.products];

    if (name) {
      const q = name.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.name_ar && p.name_ar.includes(name.trim())) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

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
    const userId = getUserIdFromReq(req);

    if (mongoose.connection.readyState === 1) {
      const [product, categories, favorites] = await Promise.all([
        Product.findOne({ id }).lean(),
        Category.find().lean(),
        userId ? Favorite.find({ user_id: userId }).lean() : Promise.resolve([]),
      ]);

      if (!product) return errorResponse(res, "Product not found.", 404);

      const { _id, __v, ...item } = product;
      return successResponse(
        res,
        "Product fetched successfully",
        {
          ...item,
          category: categories.find((c) => c.id === item.category_id) || null,
          is_favorite: favorites.some((f) => f.product_id === item.id),
        },
        200
      );
    }

    const product = db.products.find((p) => p.id === id);
    if (!product) return errorResponse(res, "Product not found.", 404);

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

// POST /api/products or /api/food
const createProduct = async (req, res) => {
  try {
    const {
      name,
      name_ar,
      description,
      price,
      category,
      category_id,
      image,
      image_url,
      spicy,
      calories,
      prep_time,
      rating,
    } = req.body;

    if (!name || price === undefined) {
      return errorResponse(res, "name and price are required", 400);
    }

    let catId = category_id;
    if (!catId && category) {
      let foundCategory;
      if (mongoose.connection.readyState === 1) {
        foundCategory = await Category.findOne({
          $or: [
            { name: { $regex: `^${category}$`, $options: "i" } },
            { id: parseInt(category) || -1 },
          ],
        }).lean();
      } else {
        foundCategory = db.categories.find(
          (c) =>
            c.name.toLowerCase() === String(category).toLowerCase() ||
            c.id === parseInt(category)
        );
      }

      if (foundCategory) {
        catId = foundCategory.id;
      } else {
        let newCatId;
        if (mongoose.connection.readyState === 1) {
          newCatId = await getNextSequence("categoryId");
          await Category.create({
            id: newCatId,
            name: String(category),
            name_ar: String(category),
            image: "default.png",
          });
        } else {
          newCatId = db.categories.length > 0 ? Math.max(...db.categories.map((c) => c.id)) + 1 : 1;
          db.categories.push({
            id: newCatId,
            name: String(category),
            name_ar: String(category),
            image: "default.png",
          });
        }
        catId = newCatId;
      }
    }

    let newId;
    if (mongoose.connection.readyState === 1) {
      newId = await getNextSequence("productId");
    } else {
      newId = db.products.length > 0 ? Math.max(...db.products.map((p) => p.id)) + 1 : 1;
    }

    const newProduct = {
      id: newId,
      name,
      name_ar: name_ar || name,
      description: description || "",
      price: parseFloat(price),
      category_id: parseInt(catId) || 1,
      image: image || image_url || "burger1.png",
      image_url: image_url || image || null,
      rating: rating ? parseFloat(rating) : 4.8,
      calories: calories ? parseInt(calories) : 500,
      prep_time: prep_time || "15-20 min",
      spicy: spicy !== undefined ? parseFloat(spicy) : 0.0,
      is_popular: req.body.is_popular === true,
    };

    if (mongoose.connection.readyState === 1) {
      await Product.create(newProduct);
    }
    db.products.push(newProduct);

    let categoryObj;
    if (mongoose.connection.readyState === 1) {
      categoryObj = await Category.findOne({ id: newProduct.category_id }).lean();
    } else {
      categoryObj = db.categories.find((c) => c.id === newProduct.category_id) || null;
    }

    return successResponse(
      res,
      "Food item created successfully",
      { ...newProduct, category: categoryObj },
      201
    );
  } catch (error) {
    return errorResponse(res, error.message || "Failed to create product.", 500);
  }
};

module.exports = { getProducts, getProductById, createProduct };
