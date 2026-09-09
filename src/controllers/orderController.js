const db = require("../config/db");
const { success, error } = require("../config/response");

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
      spicy: item.spicy ?? null,
      toppings,
      side_options: sideOptions,
      item_total: itemTotal,
    });
  }

  return { items: enriched, total };
};

// POST /api/orders
const saveOrder = (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return error(res, "items array is required and cannot be empty.", 422);
  }

  const result = buildOrderItems(items);
  if (result.error) return error(res, result.error, 404);

  const order = {
    id: db.orderIdCounter++,
    user_id: req.user.id,
    items: result.items,
    total: result.total,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  db.orders.push(order);
  return success(res, order, "Order placed successfully.", 201);
};

// GET /api/orders
const getOrders = (req, res) => {
  const userOrders = db.orders
    .filter((o) => o.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return success(res, userOrders, "Orders retrieved.");
};

// GET /api/orders/:id
const getOrderById = (req, res) => {
  const id = parseInt(req.params.id);
  const order = db.orders.find(
    (o) => o.id === id && o.user_id === req.user.id
  );

  if (!order) return error(res, "Order not found.", 404);
  return success(res, order, "Order retrieved.");
};

module.exports = { saveOrder, getOrders, getOrderById };
