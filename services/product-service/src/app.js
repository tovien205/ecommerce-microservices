// services/product-service/src/app.js
const express = require('express');
const productRoutes = require('./interfaces/http/product.routes');

const app = express();

app.use(express.json());

// Health Check
app.get(['/health', '/api/products/health'], (req, res) => {
  res.status(200).json({ status: 'ok', service: 'product-service' });
});

// Mount router xử lý API
app.use('/api/products', productRoutes);
app.use('/', productRoutes);

module.exports = app;