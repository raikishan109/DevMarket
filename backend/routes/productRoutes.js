const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    getDeveloperProducts,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { authMiddleware, developerMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);

// Developer routes (must come before /:id to avoid conflicts)
router.get('/developer/my-products', authMiddleware, developerMiddleware, getDeveloperProducts);
router.post('/', authMiddleware, developerMiddleware, createProduct);
router.put('/:id', authMiddleware, developerMiddleware, updateProduct);
router.delete('/:id', authMiddleware, developerMiddleware, deleteProduct);

// Public route with :id parameter (must come last)
router.get('/:id', getProductById);

module.exports = router;
