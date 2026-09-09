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

// Category Routes
router.get('/categories', categoryController.getAllCategories);

// Product Routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);

// Favorite Routes
router.post('/toggle-favorite', auth, favoriteController.toggleFavorite);
router.get('/favorites', auth, favoriteController.getFavorites);

// Product Options Routes
router.get('/toppings', optionsController.getToppings);
router.get('/side-options', optionsController.getSideOptions);

// Order Routes
router.post('/orders', auth, orderController.saveOrder);
router.get('/orders', auth, orderController.getOrders);
router.get('/orders/:id', auth, orderController.getOrderById);

// Cart Routes
router.post('/cart/add', auth, cartController.addToCart);
router.get('/cart', auth, cartController.getCart);
router.delete('/cart/remove/:id', auth, cartController.removeFromCart);

module.exports = router;

