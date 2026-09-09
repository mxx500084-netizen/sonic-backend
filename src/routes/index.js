const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const favoriteController = require('../controllers/favoriteController');
const optionsController = require('../controllers/optionsController');
const orderController = require('../controllers/orderController');
const cartController = require('../controllers/cartController');

const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Auth Routes
router.post('/register', upload.single('image'), authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/profile', auth, authController.getProfile);
router.post('/update-profile', auth, upload.single('image'), authController.updateProfile);
router.put('/update-profile', auth, upload.single('image'), authController.updateProfile);
router.post('/profile', auth, upload.single('image'), authController.updateProfile);
router.put('/profile', auth, upload.single('image'), authController.updateProfile);

// Category Routes
router.get('/categories', categoryController.getAllCategories);
router.get('/category', categoryController.getAllCategories);

// Product Routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);

// Favorite Routes
router.post('/toggle-favorite', auth, favoriteController.toggleFavorite);
router.post('/favorites/toggle', auth, favoriteController.toggleFavorite);
router.post('/favorite', auth, favoriteController.toggleFavorite);
router.get('/favorites', auth, favoriteController.getFavorites);
router.get('/favorite', auth, favoriteController.getFavorites);

// Product Options Routes
router.get('/toppings', optionsController.getToppings);
router.get('/side-options', optionsController.getSideOptions);
router.get('/side_options', optionsController.getSideOptions);
router.get('/sides', optionsController.getSideOptions);

// Order Routes
router.post('/orders', auth, orderController.saveOrder);
router.post('/order', auth, orderController.saveOrder);
router.get('/orders', auth, orderController.getOrders);
router.get('/order-history', auth, orderController.getOrders);
router.get('/orders/history', auth, orderController.getOrders);
router.get('/orders/:id', auth, orderController.getOrderById);
router.get('/order/:id', auth, orderController.getOrderById);

// Cart Routes
router.post('/cart/add', auth, cartController.addToCart);
router.post('/cart', auth, cartController.addToCart);
router.get('/cart', auth, cartController.getCart);
router.delete('/cart/remove/:id', auth, cartController.removeFromCart);
router.delete('/cart/:id', auth, cartController.removeFromCart);
router.post('/cart/remove/:id', auth, cartController.removeFromCart);

module.exports = router;


