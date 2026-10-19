const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  checkStock,
  updateStock,
} = require('./product.controller');

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/stock', checkStock);
router.put('/:id/stock', updateStock);

module.exports = router;
