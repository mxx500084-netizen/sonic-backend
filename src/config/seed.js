const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Topping = require("../models/Topping");
const SideOption = require("../models/SideOption");
const Order = require("../models/Order");
const CartItem = require("../models/CartItem");
const { Counter } = require("../models/Counter");
const db = require("./db");

const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("🌱 Seeding MongoDB with initial Sonic catalog data...");

      if (db.categories && db.categories.length > 0) {
        await Category.insertMany(db.categories);
      }

      if (db.products && db.products.length > 0) {
        await Product.insertMany(db.products);
      }

      if (db.toppings && db.toppings.length > 0) {
        await Topping.insertMany(db.toppings);
      }

      if (db.sideOptions && db.sideOptions.length > 0) {
        await SideOption.insertMany(db.sideOptions);
      }

      const userCount = await User.countDocuments();
      if (userCount === 0 && db.users && db.users.length > 0) {
        await User.insertMany(db.users);
      }

      const orderCount = await Order.countDocuments();
      if (orderCount === 0 && db.orders && db.orders.length > 0) {
        await Order.insertMany(db.orders);
      }

      const cartCount = await CartItem.countDocuments();
      if (cartCount === 0 && db.cartItems && db.cartItems.length > 0) {
        await CartItem.insertMany(db.cartItems);
      }

      await Counter.findByIdAndUpdate("userId", { seq: db.userIdCounter || 2 }, { upsert: true });
      await Counter.findByIdAndUpdate("orderId", { seq: db.orderIdCounter || 5 }, { upsert: true });
      await Counter.findByIdAndUpdate("cartId", { seq: db.cartIdCounter || 25 }, { upsert: true });
      await Counter.findByIdAndUpdate("productId", { seq: 28 }, { upsert: true });
      await Counter.findByIdAndUpdate("categoryId", { seq: 7 }, { upsert: true });

      console.log("✅ MongoDB successfully seeded with all initial data!");
    }
  } catch (err) {
    console.error("⚠️ Failed to seed MongoDB:", err.message);
  }
};

module.exports = seedDatabase;
