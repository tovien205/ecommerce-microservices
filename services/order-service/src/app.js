const express = require('express');
const orderRoutes = require('./interfaces/http/order.routes');

const app = express();
app.use(express.json());

// Endpoint Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'order-service' });
});

app.use('/api/orders', orderRoutes);

module.exports = app;
