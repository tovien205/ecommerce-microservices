const express = require('express');
const authRoutes = require('./interfaces/http/auth.routes');

const app = express();

app.use(express.json());

// Health check endpoint
app.get(['/health', '/api/auth/health'], (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

// Import Auth Router
app.use('/api/auth', authRoutes);
app.use('/', authRoutes);

module.exports = app;