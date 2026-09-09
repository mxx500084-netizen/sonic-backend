const db = {
  users: [
    {
      id: 1,
      name: "Motaz",
      email: "motaz@example.com",
      visa: "4111222233334444",
      password: "$2b$12$GxsIjXiFfCcEX/gDRzX.KOrgGdNFq9mrJYm9MVq.9OdCjr0Ybo7Qu", // 12345678
      image: null,
      address: "123 Main St Apartment 4A, New York, NY",
      created_at: new Date().toISOString(),
    },
  ],
  userIdCounter: 2,
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
  orders: [
    {
      id: 4,
      user_id: "1",
      items: [
        {
          product: { id: 1, name: "Classic Burger", description: "Juicy beef patty with fresh veggies", price: 59.99, category_id: 1, image: "burger1.png" },
          quantity: 2,
          spicy: 0.1,
          toppings: [{ id: 1, name: "Extra Cheese", price: 5.00 }, { id: 2, name: "Jalapeños", price: 3.00 }],
          side_options: [{ id: 1, name: "French Fries", price: 15.00 }],
          item_total: 165.98,
        },
      ],
      total: 165.98,
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ],      // { id, user_id, items, total, status, created_at }
  cartItems: [
    {
      id: 24,
      user_id: "1",
      product_id: 1,
      product: { id: 1, name: "Classic Burger", description: "Juicy beef patty with fresh veggies", price: 59.99, category_id: 1, image: "burger1.png" },
      quantity: 2,
      spicy: 0.1,
      toppings: [1, 2, 3],
      side_options: [1, 2, 3],
      created_at: new Date().toISOString(),
    },
  ],   // { id, user_id, product_id, quantity, spicy, toppings, side_options }
  orderIdCounter: 5,
  cartIdCounter: 25,
};

// Load any previously persisted users/orders/favorites/cart from disk
// so data survives a server restart or redeploy.
const { loadDb } = require("./persist");
loadDb(db);

module.exports = db;
