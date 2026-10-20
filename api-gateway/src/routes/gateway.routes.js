const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Chỉ giữ BASE URL, không cộng nối chuỗi /api/... ở đây
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const CUSTOMER_SERVICE = process.env.CUSTOMER_SERVICE_URL || 'http://customer-service:3002';
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3003';
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || 'http://order-service:3004';
const SHIPMENT_SERVICE = process.env.SHIPMENT_SERVICE_URL || 'http://shipment-service:3005';

const createCustomProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      proxyReq: fixRequestBody,
    },
  });

// 1. Auth Service Routes
router.use('/api/auth', createCustomProxy(AUTH_SERVICE));

// 2. Customer Service Routes
router.use('/api/customers', authenticateJWT, createCustomProxy(CUSTOMER_SERVICE));

// 3. Product Service Routes
const productProxy = createCustomProxy(PRODUCT_SERVICE);
router.use('/api/products', (req, res, next) => {
  if (req.method === 'GET') {
    return productProxy(req, res, next);
  }
  authenticateJWT(req, res, (err) => {
    if (err) return next(err);
    authorizeRoles('ADMIN')(req, res, () => {
      productProxy(req, res, next);
    });
  });
});

// 4. Order Service Routes
router.use('/api/orders', authenticateJWT, createCustomProxy(ORDER_SERVICE));

// 5. Shipment Service Routes
router.use('/api/shipments', authenticateJWT, createCustomProxy(SHIPMENT_SERVICE));

module.exports = router;