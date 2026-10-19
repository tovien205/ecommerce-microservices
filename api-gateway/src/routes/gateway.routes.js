const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const AUTH_SERVICE = (process.env.AUTH_SERVICE_URL || 'http://localhost:3001') + '/api/auth';
const CUSTOMER_SERVICE = (process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3002') + '/api/customers';
const PRODUCT_SERVICE = (process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003') + '/api/products';
const ORDER_SERVICE = (process.env.ORDER_SERVICE_URL || 'http://localhost:3004') + '/api/orders';
const SHIPMENT_SERVICE = (process.env.SHIPMENT_SERVICE_URL || 'http://localhost:3005') + '/api/shipments';

// Helper tạo Proxy Middleware sửa lỗi trôi Request Body
const createCustomProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      proxyReq: fixRequestBody, // Fix lỗi gửi Body rỗng sang downstream service
    },
  });

// 1. Auth Service Routes (Public)
router.use('/api/auth', createCustomProxy(AUTH_SERVICE));

// 2. Customer Service Routes (Protected)
router.use('/api/customers', authenticateJWT, createCustomProxy(CUSTOMER_SERVICE));

// 3. Product Service Routes (GET Public, POST/PUT/DELETE Protected ADMIN)
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

// 4. Order Service Routes (Protected)
router.use('/api/orders', authenticateJWT, createCustomProxy(ORDER_SERVICE));

// 5. Shipment Service Routes (Protected)
router.use('/api/shipments', authenticateJWT, createCustomProxy(SHIPMENT_SERVICE));

module.exports = router;