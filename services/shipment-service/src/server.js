require('dotenv').config();
const { connectDB } = require('./infrastructure/db');
const app = require('./app');
const { startKafkaConsumer } = require('./infrastructure/kafkaConsumer');

const PORT = process.env.PORT || 3005;

const startServer = async () => {
  await connectDB();
  await startKafkaConsumer();

  app.listen(PORT, () => {
    console.log(`?? Shipment Service dang ch?y t?i port ${PORT}`);
  });
};

startServer();
