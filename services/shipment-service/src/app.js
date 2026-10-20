// services/shipment-service/src/app.js
const express = require('express');
const shipmentRoutes = require('./interfaces/http/shipment.routes');

const app = express();

app.use(express.json());

// Health Check
app.get(['/health', '/api/shipments/health'], (req, res) => {
  res.status(200).json({ status: 'ok', service: 'shipment-service' });
});

// Mount router xử lý API
app.use('/api/shipments', shipmentRoutes);
app.use('/', shipmentRoutes);

module.exports = app;