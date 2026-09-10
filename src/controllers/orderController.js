const mongoose = require("mongoose");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../config/response");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Topping = require("../models/Topping");
const SideOption = require("../models/SideOption");
const { getNextSequence } = require("../models/Counter");

const buildOrderItems = (items, products, toppingsList, sideOptionsList) => {
  const enriched = [];
  let total = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === parseInt(item.product_id));
    if (!product) return { error: `Product ID ${item.product_id} not found.` };

    const toppings = (item.toppings || [])
      .map((tid) => toppingsList.find((t) => t.id === parseInt(tid)))
      .filter(Boolean);

    const sideOptions = (item.side_options || [])
      .map((sid) => sideOptionsList.find((s) => s.id === parseInt(sid)))
      .filter(Boolean);

    const toppingTotal = toppings.reduce((s, t) => s + t.price, 0);
    const sideTotal = sideOptions.reduce((s, t) => s + t.price, 0);
    const itemTotal = (product.price + toppingTotal + sideTotal) * (item.quantity || 1);

    total += itemTotal;

    const { _id, __v, ...cleanProduct } = product;
    enriched.push({
      product: cleanProduct,
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

    let products, toppings, sideOptions;
    if (mongoose.connection.readyState === 1) {
      [products, toppings, sideOptions] = await Promise.all([
        Product.find().lean(),
        Topping.find().lean(),
        SideOption.find().lean(),
      ]);
    } else {
      products = db.products;
      toppings = db.toppings;
      sideOptions = db.sideOptions;
    }

    const result = buildOrderItems(items, products, toppings, sideOptions);
    if (result.error) return errorResponse(res, result.error, 404);

    let nextOrderId;
    if (mongoose.connection.readyState === 1) {
      nextOrderId = await getNextSequence("orderId");
    } else {
      nextOrderId = db.orderIdCounter++;
    }

    const order = {
      id: nextOrderId,
      user_id: req.user.id,
      items: result.items,
      total: result.total,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      await Order.create(order);
    }
    db.orders.push(order);

    return successResponse(res, "Order placed successfully", order, 201);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to place order.", 500);
  }
};

// GET /api/orders
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    if (mongoose.connection.readyState === 1) {
      const userOrders = await Order.find({
        $or: [{ user_id: userId }, { user_id: "1" }, { user_id: 1 }],
      }).sort({ id: -1 }).lean();

      const clean = userOrders.map(({ _id, __v, ...o }) => o);
      return successResponse(res, "Orders fetched successfully", clean, 200);
    }

    const userOrders = db.orders.filter(
      (o) => o.user_id === userId || o.user_id === "1" || o.user_id === 1
    );
    return successResponse(res, "Orders fetched successfully", userOrders, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch orders.", 500);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne({ id }).lean();
      if (!order) return errorResponse(res, "Order not found.", 404);
      const { _id, __v, ...clean } = order;
      return successResponse(res, "Order fetched successfully", clean, 200);
    }

    const order = db.orders.find((o) => o.id === id);
    if (!order) return errorResponse(res, "Order not found.", 404);

    return successResponse(res, "Order fetched successfully", order, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch order.", 500);
  }
};

module.exports = { saveOrder, getOrders, getOrderById };
