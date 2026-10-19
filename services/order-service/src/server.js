require('dotenv').config();
const app = require('./app');
const { connectProducer } = require('./infrastructure/kafka');
const { startOutboxWorker } = require('./infrastructure/outboxWorker');

const PORT = process.env.PORT || 3004;

const startServer = async () => {
  // Kết nối Kafka Producer
  await connectProducer();

  // Khởi chạy Outbox Polling Worker
  startOutboxWorker(3000);

  app.listen(PORT, () => {
    console.log(` Order Service đang chạy tại port ${PORT}`);
  });
};

startServer();