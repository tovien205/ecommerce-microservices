const express = require('express');
const router = express.Router();
const { createOrder, getOrderById } = require('./order.controller');

router.post('/', createOrder);
router.get('/:id', getOrderById);

module.exports = router;
