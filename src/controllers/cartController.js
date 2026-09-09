const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");

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

    const processedItems = items.map((item) => {
      const productId = parseInt(item.product_id);
      const product = db.products.find((p) => p.id === productId);
      const cartItem = {
        id: db.cartIdCounter++,
        user_id: userId,
        product_id: productId,
        product: product || null,
        quantity: parseInt(item.quantity) || 1,
        spicy: item.spicy !== undefined ? parseFloat(item.spicy) : 0.0,
        toppings: Array.isArray(item.toppings) ? item.toppings.map(Number) : [],
        side_options: Array.isArray(item.side_options) ? item.side_options.map(Number) : [],
        created_at: new Date().toISOString(),
      };
      db.cartItems.push(cartItem);
      return cartItem;
    });

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
    const cartItems = db.cartItems
      .filter((c) => c.user_id === userId || c.user_id === "1")
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

// DELETE /api/cart/remove/:id
const removeFromCart = async (req, res) => {
  try {
    const cartItemId = parseInt(req.params.id);
    const userId = req.user.id;

    const index = db.cartItems.findIndex(
      (c) => c.id === cartItemId && (c.user_id === userId || c.user_id === "1")
    );

    if (index !== -1) {
      db.cartItems.splice(index, 1);
    }

    return successResponse(res, "Item removed from cart successfully", null, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to remove item from cart.", 500);
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
};

