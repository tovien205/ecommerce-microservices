const express = require('express');
const authRoutes = require('./interfaces/http/auth.routes');

const app = express();

app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth-service' });
});

// Auth Routes
app.use('/api/auth', authRoutes);

module.exports = app;