const express = require('express');
const shipmentRoutes = require('./interfaces/http/shipment.routes');

const app = express();
app.use(express.json());

// Endpoint Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'shipment-service' });
});

app.use('/api/shipments', shipmentRoutes);

module.exports = app;
