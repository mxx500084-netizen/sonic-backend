const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");

const buildOrderItems = (items) => {
  const enriched = [];
  let total = 0;

  for (const item of items) {
    const product = db.products.find((p) => p.id === parseInt(item.product_id));
    if (!product) return { error: `Product ID ${item.product_id} not found.` };

    const toppings = (item.toppings || []).map((tid) =>
      db.toppings.find((t) => t.id === parseInt(tid))
    ).filter(Boolean);

    const sideOptions = (item.side_options || []).map((sid) =>
      db.sideOptions.find((s) => s.id === parseInt(sid))
    ).filter(Boolean);

    const toppingTotal = toppings.reduce((s, t) => s + t.price, 0);
    const sideTotal = sideOptions.reduce((s, t) => s + t.price, 0);
    const itemTotal = (product.price + toppingTotal + sideTotal) * (item.quantity || 1);

    total += itemTotal;

    enriched.push({
      product,
      quantity: item.quantity || 1,
      spicy: item.spicy !== undefined ? parseFloat(item.spicy) : 0.0,
      toppings,
      side_options: sideOptions,
      item_total: itemTotal,
    });
  }

  return { items: enriched, total };
};

// POST /api/orders
const saveOrder = async (req, res) => {
  try {
    let items = req.body.items;
    if (!items && req.body.product_id) {
      items = [req.body];
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, "items array is required and cannot be empty.", 422);
    }

    const result = buildOrderItems(items);
    if (result.error) return errorResponse(res, result.error, 404);

    const order = {
      id: db.orderIdCounter++,
      user_id: req.user.id,
      items: result.items,
      total: result.total,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    db.orders.push(order);
    return successResponse(res, "Order placed successfully.", order, 201);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to place order.", 500);
  }
};

// GET /api/orders
const getOrders = async (req, res) => {
  try {
    const userOrders = db.orders
      .filter((o) => o.user_id === req.user.id || o.user_id === "1")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return successResponse(res, "Orders retrieved.", userOrders, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch orders.", 500);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = db.orders.find(
      (o) => o.id === id && (o.user_id === req.user.id || o.user_id === "1")
    );

    if (!order) return errorResponse(res, "Order not found.", 404);
    return successResponse(res, "Order retrieved.", order, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch order.", 500);
  }
};

module.exports = { saveOrder, getOrders, getOrderById };

