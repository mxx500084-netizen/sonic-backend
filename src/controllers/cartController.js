const db = require("../config/db");
const { success, error } = require("../config/response");

// POST /api/cart/add
const addToCart = (req, res) => {
  const { items } = req.body;
  const user_id = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return error(res, "items array is required and cannot be empty.", 422);
  }

  const addedItems = [];

  for (const item of items) {
    const product = db.products.find((p) => p.id === parseInt(item.product_id));
    if (!product) return error(res, `Product ID ${item.product_id} not found.`, 404);

    const cartItem = {
      id: db.cartIdCounter++,
      user_id,
      product_id: parseInt(item.product_id),
      product,
      quantity: item.quantity || 1,
      spicy: item.spicy ?? null,
      toppings: (item.toppings || []).map((tid) => db.toppings.find((t) => t.id === parseInt(tid))).filter(Boolean),
      side_options: (item.side_options || []).map((sid) => db.sideOptions.find((s) => s.id === parseInt(sid))).filter(Boolean),
      created_at: new Date().toISOString(),
    };

    db.cartItems.push(cartItem);
    addedItems.push(cartItem);
  }

  return success(res, addedItems, "Items added to cart.", 201);
};

// GET /api/cart
const getCart = (req, res) => {
  const userCart = db.cartItems.filter((c) => c.user_id === req.user.id);

  const total = userCart.reduce((sum, item) => {
    const toppingTotal = item.toppings.reduce((s, t) => s + t.price, 0);
    const sideTotal = item.side_options.reduce((s, t) => s + t.price, 0);
    return sum + (item.product.price + toppingTotal + sideTotal) * item.quantity;
  }, 0);

  return success(res, { items: userCart, total }, "Cart retrieved.");
};

// DELETE /api/cart/remove/:id
const removeFromCart = (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.cartItems.findIndex(
    (c) => c.id === id && c.user_id === req.user.id
  );

  if (index === -1) return error(res, "Cart item not found.", 404);

  db.cartItems.splice(index, 1);
  return success(res, null, "Item removed from cart.");
};

module.exports = { addToCart, getCart, removeFromCart };
