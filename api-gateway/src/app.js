const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticateJWT } = require('./middleware/auth.middleware');

const app = express();

// Health check API Gateway (Public)
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'api-gateway' }));

// 1. Auth Service (Public)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  changeOrigin: true
}));

// 2. Product Service (Public)
app.use('/api/products', createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3003',
  changeOrigin: true
}));

// 3. Khai báo Customer Proxy Middleware
const customerProxy = createProxyMiddleware({
  target: process.env.CUSTOMER_SERVICE_URL || 'http://customer-service:3002',
  changeOrigin: true
});

// Healthcheck riêng của Customer Service (Public - Bỏ qua Token)
app.get('/api/customers/health', customerProxy);

// Tất cả API Customer khác (Bắt buộc phải có JWT Token)
app.use('/api/customers', authenticateJWT, customerProxy);

// 4. Order Service (Proxy)
app.use('/api/orders', createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
  changeOrigin: true
}));

// 5. Shipment Service (Proxy)
app.use('/api/shipments', createProxyMiddleware({
  target: process.env.SHIPMENT_SERVICE_URL || 'http://shipment-service:3005',
  changeOrigin: true
}));

module.exports = app;