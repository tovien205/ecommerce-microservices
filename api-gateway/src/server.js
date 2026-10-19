require('dotenv').config();
const app = require('./app');
const redis = require('./config/redis');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.warn('Redis chưa sẵn sàng, Gateway chạy ở chế độ fallback.');
  }

  app.listen(PORT, () => {
    console.log(` API Gateway dang chạy tại http://localhost:${PORT}`);
  });
};

startServer();
