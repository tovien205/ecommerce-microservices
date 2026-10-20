const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Health check API Gateway
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'api-gateway' }));

// Forward nguyên vẹn Stream Request sang các Microservices (Không dùng express.json() ở Gateway)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  changeOrigin: true
}));

app.use('/api/customers', createProxyMiddleware({
  target: process.env.CUSTOMER_SERVICE_URL || 'http://customer-service:3002',
  changeOrigin: true
}));

app.use('/api/products', createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3003',
  changeOrigin: true
}));

app.use('/api/orders', createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
  changeOrigin: true
}));

app.use('/api/shipments', createProxyMiddleware({
  target: process.env.SHIPMENT_SERVICE_URL || 'http://shipment-service:3005',
  changeOrigin: true
}));

module.exports = app;