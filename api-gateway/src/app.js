const express = require('express');
const pinoHttp = require('pino-http');
const logger = require('./logging/logger');
const rateLimiter = require('./middleware/rateLimiter.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const gatewayRoutes = require('./routes/gateway.routes');

const app = express();

// 1. Logging Middleware
app.use(pinoHttp({ logger }));

// 2. Healthcheck Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'api-gateway' });
});

// 3. Rate Limiting Middleware (Tối đa 50 request mỗi phút cho mỗi IP)
app.use(rateLimiter(50, 60));

// 4. Định tuyến API Gateway Proxy
app.use(gatewayRoutes);

// 5. Chuẩn hóa lỗi
app.use(errorHandler);

module.exports = app;
