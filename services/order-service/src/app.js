// services/order-service/src/app.js
const express = require('express');
const orderRoutes = require('./interfaces/http/order.routes');

const app = express();

app.use(express.json());

// Health Check
app.get(['/health', '/api/orders/health'], (req, res) => {
  res.status(200).json({ status: 'ok', service: 'order-service' });
});

// Mount router xử lý API
app.use('/api/orders', orderRoutes);
app.use('/', orderRoutes);

module.exports = app;