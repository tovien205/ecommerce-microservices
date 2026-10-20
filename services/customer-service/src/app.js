const express = require('express');
const customerRoutes = require('./interfaces/http/customer.routes');

const app = express();
app.get(['/health', '/api/customers/health'], (req, res) => res.status(200).json({ status: 'ok', service: 'customer-service' }));

app.get('/api/customers/health', (req, res) => res.json({ status: 'ok', service: 'customer-service' }));

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'customer-service' });
});

app.use('/api/customers', customerRoutes);

module.exports = app;
