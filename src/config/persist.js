const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

const PERSISTED_KEYS = [
  "users",
  "favorites",
  "orders",
  "cartItems",
  "orderIdCounter",
  "cartIdCounter",
];

// Load persisted state (if any) into the live db object, in place,
// so every module that already did `require("./db")` keeps working
// with the same array references.
const loadDb = (db) => {
  if (!fs.existsSync(DATA_FILE)) return;

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const saved = JSON.parse(raw);

    if (Array.isArray(saved.users)) {
      db.users.length = 0;
      db.users.push(...saved.users);
    }
    if (Array.isArray(saved.favorites)) {
      db.favorites.length = 0;
      db.favorites.push(...saved.favorites);
    }
    if (Array.isArray(saved.orders)) {
      db.orders.length = 0;
      db.orders.push(...saved.orders);
    }
    if (Array.isArray(saved.cartItems)) {
      db.cartItems.length = 0;
      db.cartItems.push(...saved.cartItems);
    }
    if (Array.isArray(saved.blacklistedTokens)) {
      db.blacklistedTokens = new Set(saved.blacklistedTokens);
    }
    if (typeof saved.orderIdCounter === "number") {
      db.orderIdCounter = saved.orderIdCounter;
    }
    if (typeof saved.cartIdCounter === "number") {
      db.cartIdCounter = saved.cartIdCounter;
    }

    console.log(`💾 Loaded persisted data from ${DATA_FILE}`);
  } catch (err) {
    console.error("⚠️  Failed to load persisted data, starting fresh:", err.message);
  }
};

// Write the mutable parts of db to disk. Category/product/topping/side
// seed data stays hard-coded in db.js on purpose (it's reference data).
const saveDb = (db) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    const snapshot = {
      users: db.users,
      favorites: db.favorites,
      orders: db.orders,
      cartItems: db.cartItems,
      blacklistedTokens: Array.from(db.blacklistedTokens),
      orderIdCounter: db.orderIdCounter,
      cartIdCounter: db.cartIdCounter,
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(snapshot, null, 2));
  } catch (err) {
    console.error("⚠️  Failed to persist data:", err.message);
  }
};

// Debounce so a burst of requests doesn't hammer the disk with writes.
let saveTimer = null;
const scheduleSave = (db, delayMs = 300) => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveDb(db), delayMs);
};

module.exports = { loadDb, saveDb, scheduleSave, PERSISTED_KEYS, DATA_FILE };
