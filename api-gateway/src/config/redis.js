const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  lazyConnect: true,
});

redis.on('connect', () => console.log('Đã Kết nối Redis cho Rate Limiting'));
redis.on('error', (err) => console.error('Lỗi kết nối Redis:', err.message));

module.exports = redis;
