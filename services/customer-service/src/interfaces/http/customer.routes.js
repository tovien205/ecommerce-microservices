const express = require('express');
const router = express.Router();
const { createCustomer, getCustomer } = require('./customer.controller');

router.post('/', createCustomer);
router.get('/:id', getCustomer);

module.exports = router;
