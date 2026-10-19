const redis = require('../config/redis');

const rateLimiter = (limit = 20, windowInSeconds = 60) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const key = `ratelimit:${ip}`;

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowInSeconds);
      }

      if (current > limit) {
        return res.status(429).json({
          message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.',
          retryAfterSeconds: windowInSeconds
        });
      }

      next();
    } catch (error) {
      // Nếu Redis gặp sự cố, vẫn cho request đi qua để không gián đoạn hệ thống.
      console.error('Rate Limiter Error:', error.message);
      next();
    }
  };
};

module.exports = rateLimiter;
