const express = require('express');
const productRoutes = require('./interfaces/http/product.routes');

const app = express();
app.use(express.json());

// Endpoint healthcheck (Yêu cầu buột 2)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'product-service' });
});

app.use('/api/products', productRoutes);

module.exports = app;
