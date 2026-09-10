const mongoose = require("mongoose");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const { getNextSequence } = require("../models/Counter");

// POST /api/cart/add
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let items = req.body.items;

    if (!items && req.body.product_id) {
      items = [req.body];
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, "Items must be an array and cannot be empty", 400);
    }

    let products = [];
    if (mongoose.connection.readyState === 1) {
      products = await Product.find().lean();
    } else {
      products = db.products;
    }

    const processedItems = [];
    for (const item of items) {
      const productId = parseInt(item.product_id);
      const product = products.find((p) => p.id === productId);

      let nextCartId;
      if (mongoose.connection.readyState === 1) {
        nextCartId = await getNextSequence("cartId");
      } else {
        nextCartId = db.cartIdCounter++;
      }

      const cartItem = {
        id: nextCartId,
        user_id: userId,
        product_id: productId,
        product: product || null,
        quantity: parseInt(item.quantity) || 1,
        spicy: item.spicy !== undefined ? parseFloat(item.spicy) : 0.0,
        toppings: Array.isArray(item.toppings) ? item.toppings.map(Number) : [],
        side_options: Array.isArray(item.side_options) ? item.side_options.map(Number) : [],
        created_at: new Date().toISOString(),
      };

      if (mongoose.connection.readyState === 1) {
        await CartItem.create(cartItem);
      }
      db.cartItems.push(cartItem);
      processedItems.push(cartItem);
    }

    return successResponse(
      res,
      "Items added to cart successfully",
      { items: processedItems },
      200
    );
  } catch (error) {
    return errorResponse(res, error.message || "Failed to add items to cart.", 500);
  }
};

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (mongoose.connection.readyState === 1) {
      const [cartItems, products] = await Promise.all([
        CartItem.find({ $or: [{ user_id: userId }, { user_id: "1" }, { user_id: 1 }] }).lean(),
        Product.find().lean(),
      ]);

      const result = cartItems.map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        const { _id, __v, ...cleanItem } = item;
        return {
          ...cleanItem,
          product: product || item.product || null,
        };
      });

      return successResponse(res, "Cart fetched successfully", result, 200);
    }

    const cartItems = db.cartItems
      .filter((c) => c.user_id === userId || c.user_id === "1" || c.user_id === 1)
      .map((item) => {
        const product = db.products.find((p) => p.id === item.product_id);
        return {
          ...item,
          product: product || item.product || null,
        };
      });

    return successResponse(res, "Cart fetched successfully", cartItems, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch cart.", 500);
  }
};

// DELETE /api/cart/remove/:id or DELETE /api/cart/:id
const removeFromCart = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;

    if (mongoose.connection.readyState === 1) {
      await CartItem.deleteOne({ id, $or: [{ user_id: userId }, { user_id: "1" }, { user_id: 1 }] });
    }

    const index = db.cartItems.findIndex(
      (c) => c.id === id && (c.user_id === userId || c.user_id === "1" || c.user_id === 1)
    );
    if (index !== -1) {
      db.cartItems.splice(index, 1);
    }

    return successResponse(res, "Item removed from cart successfully", null, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to remove item from cart.", 500);
  }
};

module.exports = { addToCart, getCart, removeFromCart };
