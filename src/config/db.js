// In-memory database (replace with real DB like MySQL/MongoDB in production)
const db = {
  users: [],
  blacklistedTokens: new Set(),
  categories: [
    { id: 1, name: "Burgers", image: "burgers.png" },
    { id: 2, name: "Pizza", image: "pizza.png" },
    { id: 3, name: "Drinks", image: "drinks.png" },
    { id: 4, name: "Sides", image: "sides.png" },
  ],
  products: [
    { id: 1, name: "Classic Burger", description: "Juicy beef patty with fresh veggies", price: 59.99, category_id: 1, image: "burger1.png" },
    { id: 2, name: "Cheese Burger", description: "Classic burger with extra cheese", price: 69.99, category_id: 1, image: "burger2.png" },
    { id: 3, name: "Pepperoni Pizza", description: "Crispy pizza loaded with pepperoni", price: 89.99, category_id: 2, image: "pizza1.png" },
    { id: 4, name: "Cola", description: "Ice cold Coca Cola 500ml", price: 15.00, category_id: 3, image: "cola.png" },
    { id: 5, name: "French Fries", description: "Crispy golden fries", price: 25.00, category_id: 4, image: "fries.png" },
  ],
  toppings: [
    { id: 1, name: "Extra Cheese", price: 5.00 },
    { id: 2, name: "Jalapeños", price: 3.00 },
    { id: 3, name: "Mushrooms", price: 4.00 },
    { id: 4, name: "Caramelized Onions", price: 4.00 },
  ],
  sideOptions: [
    { id: 1, name: "French Fries", price: 15.00 },
    { id: 2, name: "Coleslaw", price: 10.00 },
    { id: 3, name: "Onion Rings", price: 12.00 },
  ],
  favorites: [],   // { user_id, product_id }
  orders: [],      // { id, user_id, items, total, status, created_at }
  cartItems: [],   // { id, user_id, product_id, quantity, spicy, toppings, side_options }
  orderIdCounter: 1,
  cartIdCounter: 1,
};

// Load any previously persisted users/orders/favorites/cart from disk
// so data survives a server restart or redeploy.
const { loadDb } = require("./persist");
loadDb(db);

module.exports = db;
