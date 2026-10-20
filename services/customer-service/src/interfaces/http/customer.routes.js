const express = require('express');
const router = express.Router();
const { createCustomer, getCustomer, getCustomers } = require('./customer.controller');

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomer);

module.exports = router;